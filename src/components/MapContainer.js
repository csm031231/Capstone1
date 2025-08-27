import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const MapContainer = () => {
  const webViewRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 35.233596,
    longitude: 128.889544,
  });
  const [mapReady, setMapReady] = useState(false);
  const [pendingLocationUpdate, setPendingLocationUpdate] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const locationSubscription = useRef(null);

  const getNaverMapClientId = () => {
    if (process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID) {
      return process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;
    }
    if (Constants.expoConfig?.extra?.naverMapClientId) {
      return Constants.expoConfig.extra.naverMapClientId;
    }
    if (Constants.manifest?.extra?.naverMapClientId) {
      return Constants.manifest.extra.naverMapClientId;
    }
    return null;
  };

  useEffect(() => {
    requestLocationPermission();
    
    // 컴포넌트 언마운트 시 위치 추적 정리
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapReady && pendingLocationUpdate) {
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'updateLocation',
            latitude: pendingLocationUpdate.latitude,
            longitude: pendingLocationUpdate.longitude
          }));
        }
      }, 500);
      setPendingLocationUpdate(null);
    }
  }, [mapReady, pendingLocationUpdate]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
        startLocationTracking(); // 실시간 추적 시작
      } else {
        Alert.alert('알림', '위치 권한이 필요합니다.');
      }
    } catch (error) {
      console.error('위치 권한 오류:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 5초마다 업데이트
          distanceInterval: 10, // 10미터 이동 시 업데이트
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });
          
          // 실시간으로 지도 업데이트
          if (mapReady && webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'updateLocation',
              latitude,
              longitude
            }));
          } else {
            setPendingLocationUpdate({ latitude, longitude });
          }
        }
      );
      
      setIsTracking(true);
    } catch (error) {
      console.error('위치 추적 시작 오류:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      setIsTracking(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      
      if (mapReady && webViewRef.current) {
        setTimeout(() => {
          webViewRef.current.postMessage(JSON.stringify({
            type: 'updateLocation',
            latitude,
            longitude
          }));
        }, 500);
      } else {
        setPendingLocationUpdate({ latitude, longitude });
      }
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
    }
  };

  const handleLocationPress = () => {
    if (isTracking) {
      stopLocationTracking();
    } else {
      startLocationTracking();
    }
  };

  const handleZoomIn = () => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomIn' }));
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'zoomOut' }));
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>네이버 지도</title>
        <script type="text/javascript" src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${getNaverMapClientId() || 'INVALID_CLIENT_ID'}"></script>
        <style>
            body, html { 
                margin: 0; 
                padding: 0; 
                width: 100%; 
                height: 100%; 
                overflow: hidden;
                background-color: #f0f0f0;
            }
            #map { 
                width: 100%; 
                height: 100vh; 
            }
            #fallback {
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #e8f4fd;
                font-family: Arial, sans-serif;
                text-align: center;
                flex-direction: column;
            }
        </style>
    </head>
    <body>
        <div id="fallback">
            <h3>지도 로딩 중...</h3>
            <p>네이버 지도 API를 불러오고 있습니다.</p>
        </div>
        <div id="map" style="display: none;"></div>
        
        <script>
            let map;
            let currentMarker;
            let mapInitialized = false;

            function sendMapReady() {
                if (window.ReactNativeWebView && !mapInitialized) {
                    mapInitialized = true;
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'map_ready'
                    }));
                }
            }

            function showFallbackMap() {
                const fallback = document.getElementById('fallback');
                const clientId = '${getNaverMapClientId() || 'INVALID_CLIENT_ID'}';
                const isClientIdValid = clientId !== 'INVALID_CLIENT_ID' && clientId !== 'undefined' && clientId !== 'null';
                
                fallback.innerHTML = \`
                    <h3>김해시 지도</h3>
                    <p>위도: 35.233596</p>
                    <p>경도: 128.889544</p>
                    <div style="width: 200px; height: 200px; background: #4285f4; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 20px auto;">
                        <span style="color: white; font-size: 24px;">🗺️</span>
                    </div>
                    \${!isClientIdValid ? 
                        '<p style="color: #d32f2f; font-size: 14px;">네이버 지도 Client ID가 설정되지 않았습니다</p>'
                        : 
                        '<p style="color: #666; font-size: 12px;">네이버 지도를 불러올 수 없습니다</p>'
                    }
                \`;
                setTimeout(sendMapReady, 500);
            }

            function initMap() {
                if (typeof naver === 'undefined' || !naver.maps) {
                    let retryCount = 0;
                    const checkInterval = setInterval(function() {
                        retryCount++;
                        if (naver && naver.maps) {
                            clearInterval(checkInterval);
                            createMap();
                        } else if (retryCount >= 20) {
                            clearInterval(checkInterval);
                            showFallbackMap();
                        }
                    }, 250);
                    return;
                }
                createMap();
            }

            function createMap() {
                try {
                    const defaultLocation = new naver.maps.LatLng(35.233596, 128.889544);
                    
                    map = new naver.maps.Map('map', {
                        center: defaultLocation,
                        zoom: 15,
                        mapTypeControl: true,
                        zoomControl: false,
                        logoControl: false,
                        mapDataControl: false,
                        scaleControl: true,
                    });

                    currentMarker = new naver.maps.Marker({
                        position: defaultLocation,
                        map: map,
                        icon: {
                            content: '<div style="width:16px;height:16px;background:#007AFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                            anchor: new naver.maps.Point(11, 11)
                        }
                    });

                    document.getElementById('fallback').style.display = 'none';
                    document.getElementById('map').style.display = 'block';
                    
                    setTimeout(sendMapReady, 1000);

                } catch (error) {
                    showFallbackMap();
                }
            }

            function updateLocationMarker(lat, lng) {
                if (!map) return;

                try {
                    if (currentMarker) {
                        currentMarker.setMap(null);
                    }
                    
                    map.setCenter({lat: lat, lng: lng});
                    
                    if (window.naver && window.naver.maps) {
                        const position = new window.naver.maps.LatLng(lat, lng);
                        currentMarker = new window.naver.maps.Marker({
                            position: position,
                            map: map,
                            icon: {
                                content: '<div style="width:16px;height:16px;background:#007AFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
                                anchor: new window.naver.maps.Point(11, 11)
                            }
                        });
                    }
                } catch (error) {
                    console.error('위치 업데이트 오류:', error);
                }
            }

            function zoomIn() {
                if (!map) return;
                try {
                    const newZoom = Math.min(map.getZoom() + 1, 21);
                    map.setZoom(newZoom);
                } catch (error) {
                    console.error('줌 인 오류:', error);
                }
            }

            function zoomOut() {
                if (!map) return;
                try {
                    const newZoom = Math.max(map.getZoom() - 1, 6);
                    map.setZoom(newZoom);
                } catch (error) {
                    console.error('줌 아웃 오류:', error);
                }
            }

            function handleMessage(data) {
                try {
                    const message = JSON.parse(data);
                    
                    switch(message.type) {
                        case 'updateLocation':
                            updateLocationMarker(message.latitude, message.longitude);
                            break;
                        case 'zoomIn':
                            zoomIn();
                            break;
                        case 'zoomOut':
                            zoomOut();
                            break;
                    }
                } catch (error) {
                    console.error('메시지 처리 오류:', error);
                }
            }

            // 메시지 리스너 등록
            if (window.ReactNativeWebView) {
                document.addEventListener('message', function(event) {
                    handleMessage(event.data);
                });
                
                window.addEventListener('message', function(event) {
                    handleMessage(event.data);
                });
            }

            // 타임아웃으로 폴백 보장
            setTimeout(function() {
                if (!map) {
                    showFallbackMap();
                }
            }, 10000);

            // 페이지 로드 시 지도 초기화
            window.addEventListener('load', function() {
                setTimeout(initMap, 100);
            });

        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'map_ready') {
        setMapReady(true);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ 
          html: mapHTML,
          baseUrl: 'https://localhost:8081'
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures={false}
        onError={(syntheticEvent) => {
          console.error('WebView 오류:', syntheticEvent.nativeEvent.description);
        }}
        onHttpError={(syntheticEvent) => {
          console.error('HTTP 오류:', syntheticEvent.nativeEvent);
        }}
        renderError={(errorName) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>지도를 불러올 수 없습니다</Text>
            <Text style={styles.errorSubText}>네트워크 연결을 확인해주세요</Text>
          </View>
        )}
      />

      {/* 위치 버튼 */}
      <TouchableOpacity style={[styles.locationButton, isTracking && styles.trackingButton]} onPress={handleLocationPress}>
        <Text style={styles.locationIcon}>{isTracking ? '⏹️' : '📍'}</Text>
      </TouchableOpacity>

      {/* 줌 컨트롤 */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
  },
  locationButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  trackingButton: {
    backgroundColor: '#ff4444',
  },
  locationIcon: {
    fontSize: 20,
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 220,
    zIndex: 10,
  },
  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MapContainer;