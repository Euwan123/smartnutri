import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, addDoc, orderBy, query, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const { width } = Dimensions.get('window');

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [caption, setCaption] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [tab, setTab] = useState('feed');
  const user = auth.currentUser;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'community'), orderBy('createdAt', 'desc')));
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchPosts(); }, []));

  const sharePost = async () => {
    if (!caption.trim()) return Alert.alert('Error', 'Write something first!');
    setPosting(true);
    try {
      await addDoc(collection(db, 'community'), {
        caption: caption.trim(),
        userName: user.displayName || 'Anonymous',
        userId: user.uid,
        userInitial: (user.displayName || 'A')[0].toUpperCase(),
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        isPublic: true,
      });
      setCaption('');
      setShowCompose(false);
      fetchPosts();
    } catch (e) { Alert.alert('Error', 'Failed to post'); }
    setPosting(false);
  };

  const toggleLike = async (post) => {
    const ref = doc(db, 'community', post.id);
    const liked = post.likes?.includes(user.uid);
    await updateDoc(ref, { likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
    fetchPosts();
  };

  const deletePost = async (id) => {
    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteDoc(doc(db, 'community', id)); fetchPosts(); } }
    ]);
  };

  const myPosts = posts.filter(p => p.userId === user.uid);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Community</Text>
        <TouchableOpacity style={styles.composeBtn} onPress={() => setShowCompose(!showCompose)}>
          <Text style={styles.composeBtnText}>{showCompose ? '✕ Cancel' : '✏️ Post'}</Text>
        </TouchableOpacity>
      </View>

      {showCompose && (
        <View style={styles.composeBox}>
          <View style={styles.composeHeader}>
            <View style={styles.composeAvatar}>
              <Text style={styles.composeAvatarText}>{(user.displayName || 'A')[0]}</Text>
            </View>
            <Text style={styles.composeName}>{user.displayName || 'You'}</Text>
          </View>
          <TextInput
            style={styles.composeInput}
            placeholder="Share a meal, tip, or nutrition insight..."
            placeholderTextColor="#aaa"
            multiline
            value={caption}
            onChangeText={setCaption}
            maxLength={300}
          />
          <View style={styles.composeFooter}>
            <Text style={styles.charCount}>{caption.length}/300</Text>
            <TouchableOpacity style={styles.postBtn} onPress={sharePost} disabled={posting}>
              {posting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.postBtnText}>Share 🌿</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.tabRow}>
        {['feed', 'my posts'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'feed' ? '🌎 Feed' : '👤 My Posts'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1B5E20" style={{ marginTop: 60 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14, paddingTop: 8 }}>
          {(tab === 'feed' ? posts : myPosts).length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>{tab === 'feed' ? 'No posts yet' : 'You haven\'t posted yet'}</Text>
              <Text style={styles.emptySub}>Be the first to share a meal or nutrition tip!</Text>
            </View>
          ) : (
            (tab === 'feed' ? posts : myPosts).map((post, i) => {
              const liked = post.likes?.includes(user.uid);
              const timeAgo = (() => {
                const diff = Date.now() - new Date(post.createdAt).getTime();
                const m = Math.floor(diff / 60000);
                if (m < 1) return 'Just now';
                if (m < 60) return `${m}m ago`;
                const h = Math.floor(m / 60);
                if (h < 24) return `${h}h ago`;
                return `${Math.floor(h / 24)}d ago`;
              })();

              return (
                <View key={post.id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAvatar}>
                      <Text style={styles.postAvatarText}>{post.userInitial}</Text>
                    </View>
                    <View style={styles.postMeta}>
                      <Text style={styles.postName}>{post.userName}</Text>
                      <Text style={styles.postTime}>{timeAgo}</Text>
                    </View>
                    {post.userId === user.uid && (
                      <TouchableOpacity onPress={() => deletePost(post.id)}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.postCaption}>{post.caption}</Text>
                  <View style={styles.postActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post)}>
                      <Text style={styles.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
                      <Text style={[styles.actionText, liked && styles.actionTextLiked]}>{post.likes?.length || 0} likes</Text>
                    </TouchableOpacity>
                    <View style={styles.actionBtn}>
                      <Text style={styles.actionIcon}>💬</Text>
                      <Text style={styles.actionText}>{post.comments?.length || 0} comments</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { backgroundColor: '#1B5E20', padding: 24, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  composeBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  composeBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  composeBox: { backgroundColor: '#fff', margin: 14, marginBottom: 0, borderRadius: 20, padding: 16, elevation: 4 },
  composeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  composeAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center' },
  composeAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  composeName: { fontSize: 15, fontWeight: '600', color: '#333' },
  composeInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 14, padding: 14, fontSize: 14, color: '#333', minHeight: 80, textAlignVertical: 'top', backgroundColor: '#FAFAFA' },
  composeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  charCount: { fontSize: 12, color: '#bbb' },
  postBtn: { backgroundColor: '#1B5E20', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  postBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  tabRow: { flexDirection: 'row', margin: 14, marginBottom: 4, backgroundColor: '#E8F5E9', borderRadius: 14, padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#1B5E20' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  postCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, elevation: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  postMeta: { flex: 1 },
  postName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  postTime: { fontSize: 12, color: '#999', marginTop: 1 },
  deleteIcon: { fontSize: 18 },
  postCaption: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 14 },
  postActions: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 18 },
  actionText: { fontSize: 13, color: '#999', fontWeight: '500' },
  actionTextLiked: { color: '#E53935' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center' },
});