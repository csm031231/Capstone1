import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';

const ShelterModal = ({ visible, onClose, currentLocation = null }) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(currentLocation);

  // 거리 계산 함수 (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // km
    return distance;
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('알림', '위치 권한이 필요합니다.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      return null;
    }
  };

  // 대피소 데이터 가져오기 (실제 구현시 API 호출)
  const fetchShelters = async (latitude, longitude) => {
    setLoading(true);
    try {
      // 실제 구현시에는 여기서 API를 호출합니다
      // const response = await fetch(`/api/shelters?lat=${latitude}&lng=${longitude}`);
      // const data = await response.json();
      
      // 임시 대피소 데이터 (김해시 기준)
      const mockShelters = [
        {
          id: 1,
          name: '김해시 체육관',
          address: '경남 김해시 분성로 74',
          latitude: 35.233596,
          longitude: 128.889544,
          capacity: 2000,
          type: '실내체육시설',
          contact: '055-330-3000',
          facilities: ['화장실', '전기', '난방', '주차장']
        },
        {
          id: 2,
          name: '장유중학교',
          address: '경남 김해시 장유면 장유로 155',
          latitude: 35.190156,
          longitude: 128.807892,
          capacity: 800,
          type: '학교',
          contact: '055-310-3200',
          facilities: ['화장실', '전기', '난방']
        },
        {
          id: 3,
          name: '김해문화의전당',
          address: '경남 김해시 가야의길 16',
          latitude: 35.235489,
          longitude: 128.888901,
          capacity: 1500,
          type: '문화시설',
          contact: '055-320-1000',
          facilities: ['화장실', '전기', '난방', '주차장', '무대시설']
        },
        {
          id: 4,
          name: '김해대학교 체육관',
          address: '경남 김해시 인제로 197',
          latitude: 35.205147,
          longitude: 128.912772,
          capacity: 1200,
          type: '대학교시설',
          contact: '055-320-3000',
          facilities: ['화장실', '전기', '난방', '주차장']
        },
        {
          id: 5,
          name: '진영읍사무소',
          address: '경남 김해시 진영읍 진영대로 2357',
          latitude: 35.310245,
          longitude: 128.756892,
          capacity: 300,
          type: '공공시설',
          contact: '055-330-4000',
          facilities: ['화장실', '전기']
        },
        {
          id: 6,
          name: '김해여자고등학교',
          address: '경남 김해시 가락로 225',
          latitude: 35.228901,
          longitude: 128.888234,
          capacity: 600,
          type: '학교',
          contact: '055-330-5000',
          facilities: ['화장실', '전기', '난방']
        },
        {
          id: 7,
          name: '삼계초등학교',
          address: '경남 김해시 삼계로 123',
          latitude: 35.195432,
          longitude: 128.865123,
          capacity: 400,
          type: '학교',
          contact: '055-330-6000',
          facilities: ['화장실', '전기', '난방']
        },
        {
          id: 8,
          name: '김해시청 대강당',
          address: '경남 김해시 분성로 111',
          latitude: 35.228557,
          longitude: 128.889036,
          capacity: 500,
          type: '공공시설',
          contact: '055-330-2000',
          facilities: ['화장실', '전기', '난방', '주차장']
        }
      ];

      // 각 대피소에 대해 거리 계산
      const sheltersWithDistance = mockShelters.map(shelter => ({
        ...shelter,
        distance: calculateDistance(
          latitude,
          longitude,
          shelter.latitude,
          shelter.longitude
        )
      }));

      // 거리순으로 정렬하여 가까운 순으로 8개 반환
      const sortedShelters = sheltersWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 8);

      setShelters(sortedShelters);
    } catch (error) {
      console.error('대피소 데이터 가져오기 실패:', error);
      Alert.alert('오류', '대피소 정보를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (visible) {
      const loadShelters = async () => {
        let location = userLocation;
        
        if (!location) {
          location = await getCurrentLocation();
          setUserLocation(location);
        }
        
        if (location) {
          await fetchShelters(location.latitude, location.longitude);
        }
      };
      
      loadShelters();
    }
  }, [visible, userLocation]);

  // 전화걸기
  const makeCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('오류', '전화 기능을 사용할 수 없습니다.');
        }
      })
      .catch((err) => console.error('전화걸기 오류:', err));
  };

  // 길찾기 (지도 앱 연동)
  const openNavigation = (latitude, longitude, name) => {
    const url = `http://map.naver.com/index.nhn?slng=${userLocation?.longitude}&slat=${userLocation?.latitude}&stext=현재위치&elng=${longitude}&elat=${latitude}&etext=${encodeURIComponent(name)}&menu=route&pathType=1`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // 네이버 지도가 없으면 기본 지도 앱 사용
          const fallbackUrl = `maps:${latitude},${longitude}`;
          Linking.openURL(fallbackUrl);
        }
      })
      .catch((err) => console.error('길찾기 오류:', err));
  };

  // 시설 타입별 아이콘
  const getTypeIcon = (type) => {
    switch (type) {
      case '실내체육시설':
      case '체육관':
        return '🏟️';
      case '학교':
      case '대학교시설':
        return '🏫';
      case '문화시설':
        return '🎭';
      case '공공시설':
        return '🏢';
      default:
        return '🏠';
    }
  };

  // 거리 포맷팅
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  };

  const renderShelterItem = (shelter) => (
    <View key={shelter.id} style={styles.shelterItem}>
      <View style={styles.shelterHeader}>
        <View style={styles.shelterTitleRow}>
          <Text style={styles.shelterIcon}>{getTypeIcon(shelter.type)}</Text>
          <View style={styles.shelterTitleContent}>
            <Text style={styles.shelterName}>{shelter.name}</Text>
            <Text style={styles.shelterType}>{shelter.type}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Text style={styles.distance}>{formatDistance(shelter.distance)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.shelterAddress}>{shelter.address}</Text>
      
      <View style={styles.shelterInfo}>
        <Text style={styles.capacity}>수용인원: {shelter.capacity.toLocaleString()}명</Text>
        <Text style={styles.contact}>연락처: {shelter.contact}</Text>
      </View>

      {shelter.facilities && shelter.facilities.length > 0 && (
        <View style={styles.facilitiesContainer}>
          <Text style={styles.facilitiesTitle}>편의시설:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.facilitiesList}>
              {shelter.facilities.map((facility, index) => (
                <View key={index} style={styles.facilityTag}>
                  <Text style={styles.facilityText}>{facility}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={() => makeCall(shelter.contact)}
        >
          <Text style={styles.callButtonText}>📞 전화</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.navigationButton]}
          onPress={() => openNavigation(shelter.latitude, shelter.longitude, shelter.name)}
        >
          <Text style={styles.navigationButtonText}>🗺️ 길찾기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🏠 내 주변 대피소</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {userLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                📍 현재 위치 기준 가까운 순으로 정렬
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285f4" />
              <Text style={styles.loadingText}>대피소 정보를 가져오는 중...</Text>
            </View>
          ) : (
            <ScrollView style={styles.shelterList} showsVerticalScrollIndicator={false}>
              {shelters.length > 0 ? (
                shelters.map(renderShelterItem)
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>주변 대피소 정보가 없습니다</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  locationInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  shelterList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shelterItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shelterHeader: {
    marginBottom: 12,
  },
  shelterTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  shelterIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  shelterTitleContent: {
    flex: 1,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  shelterType: {
    fontSize: 14,
    color: '#666',
  },
  distanceContainer: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  shelterAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  shelterInfo: {
    marginBottom: 12,
  },
  capacity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: '#333',
  },
  facilitiesContainer: {
    marginBottom: 16,
  },
  facilitiesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  facilitiesList: {
    flexDirection: 'row',
  },
  facilityTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  facilityText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: '#4caf50',
  },
  navigationButton: {
    backgroundColor: '#2196f3',
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ShelterModal;