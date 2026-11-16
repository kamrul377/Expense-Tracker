
// screens/GroupsScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { EmptyState, Fab } from '../components/ui';
import { radius } from '../constants/theme';
import CustomAlert from '../components/CustomAlert';
import { uploadGroupPhoto } from '../services/groupPhotoService';
import {
  acceptInvite,
  createGroup,
  declineInvite,
  joinByCode,
  subscribeMyGroups,
  subscribeMyInvites,
} from '../services/groupService';

/* ---------- helpers ---------- */

// member object theke photo ber kora (tomar field name onujayi ekhane change koro)
const memberPhoto = (m) => m?.photoURL || m?.photo || m?.avatar || null;

/* ---------- small animated building blocks ---------- */

function FadeSlide({ index = 0, children, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 450,
      delay: Math.min(index, 8) * 70,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, index]);
  return (
    <Animated.View
      style={[
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Press({ onPress, style, children, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (val) =>
    Animated.spring(scale, { toValue: val, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <TouchableWithoutFeedback onPress={onPress} onPressIn={() => to(0.96)} onPressOut={() => to(1)} disabled={disabled}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}

function Avatar({ uri, name, size = 28, color, bg, border }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: 2,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ color, fontWeight: '800', fontSize: size * 0.42 }}>{initial}</Text>
      )}
    </View>
  );
}

// users/{uid} theke live profile (avatar, name) diye group er stored member data override kore
function AvatarStack({ members, profiles, colors, primary, max = 4 }) {
  const list = Object.entries(members || {}).map(([uid, m]) => {
    const p = profiles?.[uid];
    return { name: p?.name || m?.name, photo: p?.avatar || memberPhoto(m) };
  });
  const shown = list.slice(0, max);
  const extra = list.length - shown.length;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -9 }}>
          <Avatar uri={m.photo} name={m.name} color={primary} bg={primary + '22'} border={colors.card} />
        </View>
      ))}
      {extra > 0 && (
        <View style={{ marginLeft: -9 }}>
          <Avatar name={`+${extra}`} color={colors.muted} bg={colors.border} border={colors.card} />
        </View>
      )}
    </View>
  );
}

/* ---------- screen ---------- */

export default function GroupsScreen({ navigation, route }) {
  const { user, profile, colors, isGuest } = useAuth();
  const noAccount = isGuest || !user.email;
  const primary = colors.primary || '#059669';

  const [groups, setGroups] = useState(null);
  const [invites, setInvites] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [busy, setBusy] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    showCancel: false,
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = (title, message, type = 'error', options = {}) =>
    setAlertConfig({ visible: true, title, message, type, ...options });
  const hideAlert = () => setAlertConfig((prev) => ({ ...prev, visible: false }));

  // Member der profile (Firestore users/{uid}) live load
  const [profiles, setProfiles] = useState({});
  const profileSubs = useRef({});

  useEffect(() => {
    const uids = new Set();
    [...(groups || []), ...invites].forEach((g) => {
      (g.memberUids || []).forEach((u) => uids.add(u));
      Object.keys(g.members || {}).forEach((u) => uids.add(u));
    });
    uids.forEach((uid) => {
      if (profileSubs.current[uid]) return;
      profileSubs.current[uid] = onSnapshot(
        doc(db, 'users', uid),
        (snap) => {
          if (snap.exists()) setProfiles((p) => ({ ...p, [uid]: snap.data() }));
        },
        () => { }
      );
    });
  }, [groups, invites]);

  useEffect(
    () => () => {
      Object.values(profileSubs.current).forEach((unsub) => unsub());
      profileSubs.current = {};
    },
    []
  );

  useEffect(() => {
    if (noAccount) return undefined;
    const u1 = subscribeMyGroups(user.uid, setGroups, () => setGroups([]));
    const u2 = subscribeMyInvites(user.email, setInvites, () => setInvites([]));
    return () => {
      u1();
      u2();
    };
  }, [user.uid, user.email, noAccount]);

  // Deep link (myapp://join/CODE) theke ashle auto join
  useEffect(() => {
    const c = route?.params?.joinCode;
    if (c) {
      setCode(String(c));
      doJoin(String(c));
      navigation.setParams({ joinCode: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.joinCode]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showAlert('Permission needed', 'Please allow photo access to choose a group photo.', 'error');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType ? ['images'] : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setPhotoUri(res.assets[0].uri);
      setPhotoBase64(res.assets[0].base64);
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setName('');
    setPhotoUri(null);
    setPhotoBase64(null);
  };

  const doCreate = async () => {
    if (!name.trim()) return;
    try {
      setBusy(true);
      let photoURL = null;
      if (photoBase64) photoURL = await uploadGroupPhoto(photoBase64);
      const id = await createGroup({ name, user, profile, photoURL });
      closeCreate();
      navigation.navigate('GroupDetail', { groupId: id });
    } catch (e) {
      showAlert('Error', e?.message || 'Could not create the group.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doJoin = async (c) => {
    try {
      setBusy(true);
      const id = await joinByCode(c || code, user, profile);
      setCode('');
      setJoinOpen(false);
      navigation.navigate('GroupDetail', { groupId: id });
    } catch (e) {
      showAlert('Join failed', 'The code is incorrect, or the group could not be found.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const doAccept = async (g) => {
    try {
      await acceptInvite(g.id, user, profile);
    } catch (e) {
      showAlert('Error', 'Invite accept kora jayni.', 'error');
    }
  };

  const doDecline = async (g) => {
    try {
      await declineInvite(g.id, user.email);
    } catch (e) {
      showAlert('Error', 'Decline kora jayni.', 'error');
    }
  };

  if (noAccount) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState
          icon="account-lock-outline"
          title="Account Required"
          subtitle="Please create an account using your email and log in to use group features. Group features are not available in guest mode."
        />
      </View>
    );
  }

  if (groups === null) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <FadeSlide index={0}>
              <Press
                onPress={() => setJoinOpen(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: primary + '14',
                  borderWidth: 1,
                  borderColor: primary + '40',
                  borderRadius: radius.lg || 20,
                  padding: 14,
                  marginBottom: 18,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    backgroundColor: primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="link-variant" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>Join with invite code</Text>
                  <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2 }}>Got a code from a friend?</Text>
                </View>
                <Icon name="arrow-right" size={20} color={primary} />
              </Press>
            </FadeSlide>

            {invites.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 }}>
                  INVITATIONS ({invites.length})
                </Text>
                {invites.map((g, i) => (
                  <FadeSlide key={g.id} index={i + 1}>
                    <View
                      style={{
                        backgroundColor: colors.card,
                        borderWidth: 1.5,
                        borderColor: primary,
                        borderRadius: radius.lg || 20,
                        padding: 14,
                        marginBottom: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <GroupThumb uri={g.photoURL} primary={primary} size={46} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
                            {g.name}
                          </Text>
                          <View style={{ marginTop: 6 }}>
                            <AvatarStack members={g.members} profiles={profiles} colors={colors} primary={primary} />
                          </View>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <Press
                          onPress={() => doAccept(g)}
                          style={{ flex: 1, backgroundColor: primary, borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700' }}>Accept</Text>
                        </Press>
                        <Press
                          onPress={() => doDecline(g)}
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 12,
                            paddingVertical: 10,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: colors.muted, fontWeight: '700' }}>Decline</Text>
                        </Press>
                      </View>
                    </View>
                  </FadeSlide>
                ))}
              </View>
            )}

            {groups.length > 0 && (
              <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 }}>MY GROUPS</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="account-group-outline" title="No groups yet" subtitle="Shared Expenses for Tours or Trips" />
        }
        renderItem={({ item: g, index }) => {
          const count = (g.memberUids || []).length;
          const mine = g.createdBy === user.uid;
          return (
            <FadeSlide index={index + 2}>
              <Press
                onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  borderRadius: radius.lg || 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                }}
              >
                <GroupThumb uri={g.photoURL} primary={primary} size={56} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <Text style={{ color: colors.dim, fontSize: 12, marginTop: 2, marginBottom: 8 }}>
                    {count} {count === 1 ? 'member' : 'members'}
                    {mine ? ' · You created' : ''}
                  </Text>
                  <AvatarStack members={g.members} profiles={profiles} colors={colors} primary={primary} />
                </View>
                <Icon name="chevron-right" size={22} color={colors.dim} />
              </Press>
            </FadeSlide>
          );
        }}
      />
      <Fab onPress={() => setCreateOpen(true)} />

      <SmallModal visible={createOpen} onClose={closeCreate} title="New group" colors={colors}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Press onPress={pickPhoto}>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 32,
                backgroundColor: primary + '1F',
                borderWidth: 2,
                borderColor: primary + '55',
                borderStyle: photoUri ? 'solid' : 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Icon name="camera-plus-outline" size={32} color={primary} />
              )}
            </View>
          </Press>
          <Text style={{ color: colors.dim, fontSize: 12, marginTop: 8 }}>
            {photoUri ? 'Tap to change photo' : 'Add group photo (optional)'}
          </Text>
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Group name (e.g. Cox's Bazar Tour)"
          placeholderTextColor={colors.dim}
          style={inputStyle(colors)}
          autoFocus
        />
        <PrimaryBtn label="Create group" onPress={doCreate} busy={busy} color={primary} />
      </SmallModal>

      <SmallModal visible={joinOpen} onClose={() => setJoinOpen(false)} title="Join a group" colors={colors}>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder="Invite code"
          autoCapitalize="characters"
          placeholderTextColor={colors.dim}
          style={inputStyle(colors)}
          autoFocus
        />
        <PrimaryBtn label="Join" onPress={() => doJoin()} busy={busy} color={primary} />
      </SmallModal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        showCancel={alertConfig.showCancel}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </View>
  );
}

/* ---------- shared pieces ---------- */

function GroupThumb({ uri, primary, size }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: primary + '22',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Icon name="account-group" size={size * 0.5} color={primary} />
      )}
    </View>
  );
}

const inputStyle = (colors) => ({
  backgroundColor: colors.bg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: colors.text,
  marginBottom: 14,
});

export function PrimaryBtn({ label, onPress, busy, color }) {
  return (
    <Press onPress={onPress} disabled={busy}>
      <View
        style={{
          backgroundColor: color,
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>{label}</Text>}
      </View>
    </Press>
  );
}

export function SmallModal({ visible, onClose, title, colors, children }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
    }
  }, [visible, anim]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <Animated.View
          style={{
            backgroundColor: colors.card,
            borderRadius: 26,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: anim,
            transform: [
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
            ],
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
            <Press onPress={onClose}>
              <Icon name="close" size={22} color={colors.dim} />
            </Press>
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
