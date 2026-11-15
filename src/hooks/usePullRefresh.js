// hooks/usePullRefresh.js
// Jekono scroll screen e: <ScrollView refreshControl={refreshControl}> ba <FlatList refreshControl={refreshControl}>
import React, { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function usePullRefresh() {
  const { colors } = useAuth();
  const { refresh } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressBackgroundColor={colors.card}
    />
  );

  return { refreshing, onRefresh, refreshControl };
}
