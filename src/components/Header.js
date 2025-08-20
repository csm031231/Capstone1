import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';

const Header = ({ searchText, setSearchText }) => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const [userInfo, setUserInfo] = useState({
    name: '김해시민',
    email: 'user@example.com',
    phone: '010-1234-5678',
    favoriteLocation: '김해시 장유면'
  });

  // 메뉴 아이템 클릭 핸들러
  const handleMenuItemPress = (item) => {
    setShowSideMenu(false);
    
    switch (item) {
      case 'login':
        handleLogin();
        break;
      case 'signup':
        handleSignup();
        break;
      case 'logout':
        handleLogout();
        break;
      case 'interest-location':
        handleInterestLocation();
        break;
      case 'profile-edit':
        handleProfileEdit();
        break;
      case 'settings':
        handleSettings();
        break;
      case 'help':
        handleHelp();
        break;
      default:
        console.log('Unknown menu item:', item);
    }
  };

  const handleLogin = () => {
    // 실제 구현시에는 로그인 화면으로 네비게이션
    Alert.alert(
      '로그인',
      '로그인 기능을 구현하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '데모 로그인', 
          onPress: () => {
            setIsLoggedIn(true);
            Alert.alert('성공', '로그인되었습니다.');
          }
        }
      ]
    );
  };

  const handleSignup = () => {
    Alert.alert('회원가입', '회원가입 화면으로 이동합니다.');
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          onPress: () => {
            setIsLoggedIn(false);
            Alert.alert('완료', '로그아웃되었습니다.');
          }
        }
      ]
    );
  };

  const handleInterestLocation = () => {
    Alert.alert('관심지역', '관심지역 설정 화면으로 이동합니다.');
  };

  const handleProfileEdit = () => {
    Alert.alert('회원정보수정', '회원정보 수정 화면으로 이동합니다.');
  };

  const handleSettings = () => {
    Alert.alert('설정', '앱 설정 화면으로 이동합니다.');
  };

  const handleHelp = () => {
    Alert.alert('도움말', '도움말 및 문의 화면으로 이동합니다.');
  };

  // 로그인 전 메뉴 아이템
  const guestMenuItems = [
    { id: 'login', title: '로그인', icon: '🔑', description: '계정에 로그인하세요' },
    { id: 'signup', title: '회원가입', icon: '👤', description: '새 계정을 만드세요' },
    { id: 'interest-location', title: '관심지역', icon: '📍', description: '관심 있는 지역을 설정하세요' },
    { id: 'help', title: '도움말', icon: '❓', description: '사용법 및 문의사항' },
  ];

  // 로그인 후 메뉴 아이템
  const userMenuItems = [
    { id: 'profile-edit', title: '회원정보수정', icon: '✏️', description: '개인정보를 수정하세요' },
    { id: 'interest-location', title: '관심지역', icon: '📍', description: '관심 있는 지역을 관리하세요' },
    { id: 'settings', title: '설정', icon: '⚙️', description: '앱 설정을 변경하세요' },
    { id: 'help', title: '도움말', icon: '❓', description: '사용법 및 문의사항' },
    { id: 'logout', title: '로그아웃', icon: '🚪', description: '계정에서 로그아웃' },
  ];

  const currentMenuItems = isLoggedIn ? userMenuItems : guestMenuItems;

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        item.id === 'logout' && styles.logoutMenuItem
      ]}
      onPress={() => handleMenuItemPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemLeft}>
          <Text style={styles.menuItemIcon}>{item.icon}</Text>
          <View style={styles.menuItemTextContainer}>
            <Text style={[
              styles.menuItemTitle,
              item.id === 'logout' && styles.logoutText
            ]}>
              {item.title}
            </Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          </View>
        </View>
        <Text style={styles.menuItemArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="검색"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.voiceButton}>
            <Text style={styles.voiceIcon}>🎤</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowSideMenu(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* 사이드 메뉴 모달 */}
      <Modal
        visible={showSideMenu}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSideMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowSideMenu(false)}
          />
          
          <View style={styles.sideMenuContainer}>
            <View style={styles.menuHeader}>
              <View style={styles.userSection}>
                {isLoggedIn ? (
                  <>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>👤</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{userInfo.name}</Text>
                      <Text style={styles.userEmail}>{userInfo.email}</Text>
                      <Text style={styles.userLocation}>📍 {userInfo.favoriteLocation}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.guestAvatar}>
                      
                    </View>
                    <View style={styles.guestInfo}>
                      <Text style={styles.guestTitle}>안녕하세요!</Text>
                      <Text style={styles.guestSubtitle}>로그인하여 더 많은 서비스를 이용하세요</Text>
                    </View>
                  </>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowSideMenu(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
              <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>
                  {isLoggedIn ? '계정 관리' : '시작하기'}
                </Text>
                {currentMenuItems.map(renderMenuItem)}
              </View>

              <View style={styles.appInfo}>
                <Text style={styles.appName}>김해 재난안전 앱</Text>
                <Text style={styles.appVersion}>버전 1.0.0</Text>
                <Text style={styles.appDescription}>
                  김해시민을 위한 재난안전 정보 서비스
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  menuIcon: {
    fontSize: 18,
    color: '#333',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  voiceButton: {
    padding: 4,
  },
  voiceIcon: {
    fontSize: 16,
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenuContainer: {
    width: 320,
    backgroundColor: '#ffffff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  // 메뉴 헤더
  menuHeader: {
    backgroundColor: '#4285f4',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  guestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  guestAvatarText: {
    fontSize: 24,
  },
  guestInfo: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  guestSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // 메뉴 컨텐츠
  menuContent: {
    flex: 1,
  },
  menuSection: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutMenuItem: {
    borderBottomColor: '#ffebee',
    backgroundColor: '#fff5f5',
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  logoutText: {
    color: '#d32f2f',
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16,
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: 'bold',
  },

  // 앱 정보
  appInfo: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default Header;