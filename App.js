// App.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './src/components/Header';
import MapContainer from './src/components/MapContainer';
import BottomSheet from './src/components/BottomSheet';
import BottomNavigation from './src/components/BottomNavigation';

export default function App() {
  const [selectedTab, setSelectedTab] = useState('재난문자'); // 기본값 유지
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.container}>
      {/* 상단 패딩 추가 - StatusBar 공간 확보 */}
      <View style={styles.statusBarSpace} />
      
      {/* Header 영역 */}
      <Header searchText={searchText} setSearchText={setSearchText} />

      {/* 지도 + BottomSheet 영역 */}
      <View style={styles.mapSection}>
        <MapContainer />
        <BottomSheet selectedTab={selectedTab} />
      </View>

      {/* 하단 네비게이션 */}
      <BottomNavigation selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBarSpace: {
    height: 44, // iPhone의 일반적인 StatusBar 높이
    backgroundColor: '#ffffff',
  },
  mapSection: {
    flex: 1,
    position: 'relative',
  },
});