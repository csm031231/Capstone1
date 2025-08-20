import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const TabButton = ({ title, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isSelected && styles.selectedTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isSelected && styles.selectedTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const BottomNavigation = ({ selectedTab, setSelectedTab }) => {
  const tabs = ['재난문자', '뉴스', '재난행동요령', '대피소']; // 마이페이지 제거

  return (
    <View style={styles.bottomNavigation}>
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          title={tab}
          isSelected={selectedTab === tab}
          onPress={() => setSelectedTab(tab)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    paddingBottom: 45,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    justifyContent: 'center',
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4285f4',
  },
  tabText: {
    fontSize: 12, // 4개 탭이므로 폰트 크기 유지
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  selectedTabText: {
    color: '#4285f4',
    fontWeight: '500',
  },
});

export default BottomNavigation;