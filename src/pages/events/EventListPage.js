import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import EventManagementModal from './EventManagementModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EventFeedbackModal from './EventFeedbackModal';
import './styles/EventList.css';

// Banner component dùng riêng cho trang sự kiện (code chung trong file)
const EventsBanner = () => (
  <div style={{
    width: '100vw',
    minHeight: 260,
    background: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80'), linear-gradient(120deg, #5eb6e9 0%, #a7e9af 100%)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    animation: 'slowZoom 30s infinite alternate ease-in-out'
  }}>
    <div style={{
      width: '100vw',
      minHeight: 260,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem 1rem'
    }}>
      <h1 style={{
        color: '#fff',
        fontSize: '2.8rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        animation: 'fadeInUp 0.8s ease-out',
        letterSpacing: '-0.5px'
      }}>Sự kiện cộng đồng</h1>
      <p style={{
        color: '#e0f7fa',
        fontSize: '1.25rem',
        fontWeight: 400,
        textShadow: '0 1px 4px rgba(0,0,0,0.2)',
        animation: 'fadeInUp 1s ease-out'
      }}>Khám phá, đăng ký và tham gia các sự kiện ý nghĩa dành cho bạn!</p>
    </div>
  </div>
);

// Event Detail Modal Component
const EventDetailModal = ({ event, isOpen, onClose }) => {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && event?.id) {
      setIsClosing(false);
      fetchEventDetails();
    }
  }, [isOpen, event?.id]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventService.getEventById(event.id);
      if (response && response.success) {
        setEventDetails(response.data);
      } else {
        setError('Không thể tải thông tin chi tiết sự kiện');
      }
    } catch (err) {
      setError('Lỗi khi tải thông tin sự kiện');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    className: `modal-overlay ${isClosing ? 'closing' : ''}`,
    onClick: handleClose
  }, 
    React.createElement('div', {
      className: 'modal-content event-detail-modal',
      onClick: (e) => e.stopPropagation()
    }, [
      React.createElement('div', { className: 'modal-header', key: 'header' }, [
        React.createElement('h2', { key: 'title' }, event?.title || 'Chi tiết sự kiện'),
        React.createElement('button', {
          className: 'modal-close',
          onClick: handleClose,
          key: 'close'
        }, '×')
      ]),
        React.createElement('div', { className: 'modal-body', key: 'body' }, [
        loading && React.createElement('div', { 
          key: 'loading',
          style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            fontSize: '16px',
            color: '#666'
          }
        }, 'Đang tải...'),
        error && React.createElement('div', { 
          key: 'error',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '6px',
            color: '#721c24',
            fontSize: '14px',
            margin: '16px 0'
          }
        }, ['⚠️ ', error]),
        
        eventDetails && React.createElement('div', { className: 'event-detail-content', key: 'content' }, [
          eventDetails.imageUrl && React.createElement('div', { 
            className: 'detail-image',
            key: 'image'
          }, React.createElement('img', {
            src: eventDetails.imageUrl,
            alt: eventDetails.title
          })),
          
          React.createElement('div', { className: 'detail-info', key: 'info' }, [
            React.createElement('div', { className: 'info-section', key: 'time' }, [
              React.createElement('h3', { key: 'time-title' }, '📅 Thời gian'),
              React.createElement('p', { key: 'start' }, `Bắt đầu: ${formatDate(eventDetails.startTime || eventDetails.startDate)}`),
              eventDetails.endTime && React.createElement('p', { key: 'end' }, `Dự kiến kết thúc: ${formatDate(eventDetails.endTime)}`)
            ]),
            
            eventDetails.location && React.createElement('div', { className: 'info-section', key: 'location' }, [
              React.createElement('h3', { key: 'loc-title' }, '📍 Địa điểm'),
              React.createElement('p', { key: 'loc-text' }, eventDetails.location)
            ]),
            
            React.createElement('div', { className: 'info-section', key: 'desc' }, [
              React.createElement('h3', { key: 'desc-title' }, '📝 Mô tả'),
              React.createElement('div', { 
                className: 'description-content',
                key: 'desc-content'
              }, eventDetails.description || 'Chưa có mô tả')
            ]),
            
            eventDetails.creatorName && React.createElement('div', { className: 'info-section', key: 'creator' }, [
              React.createElement('h3', { key: 'creator-title' }, '👤 Người tạo'),
              React.createElement('p', { key: 'creator-text' }, eventDetails.creatorName)
            ]),
            
            React.createElement('div', { className: 'info-section', key: 'participants' }, [
              React.createElement('h3', { key: 'part-title' }, '👥 Tham gia'),
              React.createElement('p', { key: 'part-text' }, 
                `${eventDetails.participantCount || 0} người đã đăng ký${eventDetails.maxParticipants ? ` / ${eventDetails.maxParticipants} tối đa` : ''}`
              )
            ])
          ])
        ])
      ]),
        React.createElement('div', { className: 'modal-footer', key: 'footer' }, [
        React.createElement('button', {
          className: 'btn-secondary',
          onClick: handleClose,
          key: 'close-btn'
        }, 'Đóng')
      ])
    ])
  );
};

// Simple registration button component
const EventRegistrationButton = ({ event, onRegistrationChange, onFeedbackClick }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [lastCheckedUserId, setLastCheckedUserId] = useState(null); // Track để biết khi nào user thay đổi  // Khởi tạo currentUserId và kiểm tra cache ngay từ đầu
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
    
    // Nếu có userId và event ID, thử load từ cache ngay lập tức
    if (userId && event?.id && isAuthenticated) {
      const cacheKey = `event_registration_${event.id}_${userId}`;
      const cachedStatus = localStorage.getItem(cacheKey);
      
      if (cachedStatus) {
        try {
          const cached = JSON.parse(cachedStatus);
          
          // Validate cache
          const isCacheValid = cached.userId === userId && cached.version >= 1;
          
          if (isCacheValid) {
            // Nếu cache hợp lệ, set ngay và tắt checking
            console.log('🚀 Early cache load:', cached);
            setIsRegistered(cached.isRegistered);
            setHasCheckedRegistration(true);
            setCheckingStatus(false);
            setError(null);
            setLastCheckedUserId(userId); // Đánh dấu đã check cho user này
            return; // Return ngay để tránh tiếp tục logic khác
          }
        } catch (e) {
          console.log('❌ Invalid early cache data');
        }
      }
    }
    
    // Nếu không có cache hoặc không authenticated, vẫn set initial state
    if (!isAuthenticated) {
      setCheckingStatus(false);
      setHasCheckedRegistration(true);
    }
  }, [event?.id, isAuthenticated]); // Loại bỏ dependency không cần thiết// Reset state when event or user changes
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    // Chỉ reset khi userId thực sự thay đổi (không phải object reference)
    if (currentUserId !== userId && currentUserId !== null) {
      console.log('User changed, checking registration state for new user:', {
        oldUserId: currentUserId,
        newUserId: userId,
        eventId: event?.id
      });
      
      // KHÔNG xóa cache đăng ký vì đó là dữ liệu quan trọng
      // Chỉ reset các state tạm thời
      setError(null);
      setHasCheckedRegistration(false);
      setCheckingStatus(true);
      // KHÔNG reset isRegistered - để logic check từ cache/API quyết định
    }
    
    // Luôn cập nhật currentUserId để track
    if (currentUserId !== userId) {
      setCurrentUserId(userId);
    }
  }, [currentUserId, event?.id]);  // Clear cache chỉ khi user đăng xuất hoàn toàn (không có token)
  useEffect(() => {
    const clearOldCache = () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('accessToken');
      
      // CHỈ clear cache khi user thực sự đăng xuất (không có token)
      if (!token || !isAuthenticated) {
        console.log('User logged out completely, clearing all registration cache');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('event_registration_')) {
            localStorage.removeItem(key);
            console.log('Removed cache:', key);
          }
        });
        
        // Reset state về initial
        setError(null);
        setHasCheckedRegistration(false);
        setIsRegistered(false);
        setCheckingStatus(true);
        setLastCheckedUserId(null);
      }
    };
    
    clearOldCache();
  }, [isAuthenticated]);  // Chỉ check khi authentication status thay đổi
  // Debug logging để theo dõi state changes
  useEffect(() => {
    console.log('🔍 EventRegistrationButton state changed:', {
      eventId: event?.id,
      isRegistered,
      hasCheckedRegistration,
      checkingStatus,
      isAuthenticated: isAuthenticated,
      userId: localStorage.getItem('userId'),
      timestamp: new Date().toISOString()
    });
  }, [isRegistered, hasCheckedRegistration, checkingStatus]);

    // Function để force reload registration status
  const forceReloadRegistrationStatus = async () => {
    if (!isAuthenticated || !event?.id) {
      return;
    }

    setCheckingStatus(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      console.log('Force reloading registration status:', {
        eventId: event.id,
        userId: userId,
        hasToken: !!token
      });

      const response = await eventService.checkRegistrationStatus(event.id);
      
      console.log('Force reload response:', {
        eventId: event.id,
        response: response,
        success: response?.success,
        isRegistered: response?.data?.isRegistered
      });      if (response && response.success) {
        const registrationStatus = response.data.isRegistered || false;
        
        // Chỉ update state nếu nó khác với state hiện tại
        if (isRegistered !== registrationStatus) {
          console.log('🔄 Updating registration status from API:', {
            currentState: isRegistered,
            newState: registrationStatus
          });
          setIsRegistered(registrationStatus);
        }
        
        setHasCheckedRegistration(true);
          // Cập nhật cache với dữ liệu mới và version
        const cacheKey = `event_registration_${event.id}_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          isRegistered: registrationStatus,
          timestamp: Date.now(),
          version: 1,
          userId: userId
        }));
        
        if (registrationStatus) {
          setError(null);
          console.log('✅ User is registered - updating UI');
        } else {
          console.log('❌ User is not registered');
        }
      }
    } catch (error) {
      console.error('Force reload error:', error);
    } finally {
      setCheckingStatus(false);
    }
  };  // Sử dụng useCallback để tránh re-create function mỗi lần render
  const checkRegistrationStatusCallback = useCallback(async () => {
    if (!isAuthenticated || !event?.id) {
      setCheckingStatus(false);
      setHasCheckedRegistration(true);
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setCheckingStatus(false);
      setHasCheckedRegistration(true);
      return;
    }

    // Nếu đã có cache và đã set từ early cache load, không cần check lại
    if (hasCheckedRegistration && lastCheckedUserId === userId) {
      console.log('✅ Already checked for this user, skipping');
      return;
    }

    console.log('🔍 Starting registration status check callback:', {
      eventId: event.id,
      userId: userId,
      lastCheckedUserId: lastCheckedUserId,
      hasCheckedRegistration: hasCheckedRegistration
    });

    return { userId, shouldContinue: true };
  }, [event?.id, isAuthenticated, hasCheckedRegistration, lastCheckedUserId]);

  // Check registration status on component mount
  useEffect(() => {
    let mounted = true; // Biến để kiểm tra component còn mounted không
    let fallbackTimeoutId = null; // Timeout fallback để tắt checking state
    
    const checkRegistrationStatus = async () => {
      // Sử dụng callback để validation
      const checkResult = await checkRegistrationStatusCallback();
      if (!checkResult?.shouldContinue) {
        return;
      }
      
      const { userId } = checkResult;

      // Reset state khi bắt đầu check mới
      if (mounted) {
        setCheckingStatus(true);
        setError(null);
        setHasCheckedRegistration(false);
        
        // Đặt timeout fallback 12 giây - nếu API không trả về thì tự động tắt checking
        fallbackTimeoutId = setTimeout(() => {
          if (mounted) {
            console.log('⏰ Fallback timeout - force stopping check status');
            setCheckingStatus(false);
            setHasCheckedRegistration(true);
          }
        }, 12000);
      }

      // Luôn kiểm tra cache trước, chỉ force reload khi thực sự cần thiết
      const shouldForceReload = lastCheckedUserId !== null && lastCheckedUserId !== userId;
      
      // Kiểm tra cache trước khi gọi API (luôn kiểm tra cache trước)
      const cacheKey = `event_registration_${event.id}_${userId}`;
      const cachedStatus = localStorage.getItem(cacheKey);

      console.log('🔍 Starting registration status check:', {
        eventId: event.id,
        userId: userId,
        lastCheckedUserId: lastCheckedUserId,
        shouldForceReload: shouldForceReload,
        hasCachedStatus: !!cachedStatus,
        hasCheckedRegistration: hasCheckedRegistration
      });

      // Luôn kiểm tra cache trước, chỉ bỏ qua nếu force reload được yêu cầu
      if (cachedStatus && !shouldForceReload) {
        try {
          const cached = JSON.parse(cachedStatus);
          
          // Validate cache: đảm bảo cache đúng user và có version hợp lệ
          const isCacheValid = cached.userId === userId && cached.version >= 1;
          
          if (!isCacheValid) {
            console.log('❌ Cache invalid (wrong user or old version), removing:', cacheKey);
            localStorage.removeItem(cacheKey);
          } else {
            // Nếu đã đăng ký (isRegistered = true), thì KHÔNG bao giờ hết hạn
            // Chỉ hết hạn cache khi chưa đăng ký (để re-check xem có đăng ký không)
            const isExpired = !cached.isRegistered && (Date.now() - cached.timestamp > 5 * 60 * 1000); // 5 phút
            
            if (!isExpired) {
              console.log('📋 Using valid cached registration status:', cached);
              if (mounted) {
                clearTimeout(fallbackTimeoutId); // Clear fallback timeout
                setIsRegistered(cached.isRegistered);
                setHasCheckedRegistration(true);
                setCheckingStatus(false);
                if (cached.isRegistered) {
                  setError(null);
                }
                // Update lastCheckedUserId để tránh force reload không cần thiết
                setLastCheckedUserId(userId);
              }
              return;
            } else {
              console.log('⏰ Cache expired for unregistered status, removing:', cacheKey);
              localStorage.removeItem(cacheKey);
            }
          }
        } catch (e) {
          console.log('❌ Invalid cache data, removing:', cacheKey);
          localStorage.removeItem(cacheKey);
        }
      }

      if (shouldForceReload) {
        console.log('🔄 Force reloading registration status for new user session');
      }

      try {
        // Debug: Kiểm tra token và user
        const token = localStorage.getItem('accessToken');
        const userEmail = localStorage.getItem('userEmail');
        console.log('🔍 Checking registration status:', {
          eventId: event.id,
          hasToken: !!token,
          userId: userId,
          userEmail: userEmail,
          tokenLength: token ? token.length : 0,
          forceReload: shouldForceReload
        });

        const response = await eventService.checkRegistrationStatus(event.id);
          console.log('📡 Registration status response:', {
          eventId: event.id,
          response: response,
          success: response?.success,
          isRegistered: response?.data?.isRegistered,
          currentUserId: userId,
          responseStructure: JSON.stringify(response, null, 2)
        });

        if (mounted && response && response.success) {
          // Sử dụng response đã được normalized từ eventService
          const registrationStatus = Boolean(response.data?.isRegistered);
          console.log('✅ Setting registration status:', {
            eventId: event.id,
            registrationStatus: registrationStatus,
            userId: userId,
            rawData: response.data,
            booleanConversion: Boolean(response.data?.isRegistered)
          });

          clearTimeout(fallbackTimeoutId); // Clear fallback timeout
          setIsRegistered(registrationStatus);
          
          // Cache kết quả mới với version để đảm bảo tính nhất quán
          localStorage.setItem(cacheKey, JSON.stringify({
            isRegistered: registrationStatus,
            timestamp: Date.now(),
            version: 1, // Version để đảm bảo tương thích trong tương lai
            userId: userId // Đảm bảo cache đúng user
          }));
          
          // Xóa lỗi cũ nếu đã đăng ký thành công
          if (registrationStatus) {
            setError(null);
          }
        } else if (mounted) {
          console.log('❌ API response not successful:', response);
          clearTimeout(fallbackTimeoutId); // Clear fallback timeout ngay cả khi fail
        }
      } catch (error) {
        console.log('⚠️ Could not check registration status:', error);
        console.log('Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          eventId: event.id
        });
        
        if (mounted) {
          clearTimeout(fallbackTimeoutId); // Clear fallback timeout
          
          // Nếu là timeout hoặc network error, thử sử dụng cache cũ nếu có
          if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            console.log('🕒 Request timeout, trying to use any available cache');
            if (cachedStatus) {
              try {
                const cached = JSON.parse(cachedStatus);
                if (cached.userId === userId) {
                  console.log('📋 Using cached status due to timeout:', cached);
                  setIsRegistered(cached.isRegistered);
                  if (cached.isRegistered) {
                    setError(null);
                  }
                }
              } catch (e) {
                console.log('❌ Could not parse cached data during timeout fallback');
              }
            }
          }
        }
        
        // Không hiển thị lỗi cho việc kiểm tra trạng thái
      } finally {
        if (mounted) {
          clearTimeout(fallbackTimeoutId); // Đảm bảo clear timeout
          setCheckingStatus(false);
          setHasCheckedRegistration(true);
          // Luôn update lastCheckedUserId sau khi check (thành công hay thất bại)
          setLastCheckedUserId(userId);
        }
      }
    };

    // Chỉ chạy khi cần thiết
    if (event?.id && isAuthenticated) {
      checkRegistrationStatus();
    }
    
    // Cleanup function
    return () => {
      mounted = false;
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
      }
    };
  }, [event?.id, checkRegistrationStatusCallback]); // Chỉ dependency cần thiết

  // Debug effect để track state changes
  useEffect(() => {
    console.log('🔄 Registration state changed:', {
      eventId: event?.id,
      isRegistered,
      hasCheckedRegistration,
      checkingStatus,
      lastCheckedUserId,
      currentUserId,
      userId: localStorage.getItem('userId')
    });
  }, [isRegistered, hasCheckedRegistration, checkingStatus, lastCheckedUserId]);

  const handleRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('🚀 Starting registration process:', {
      eventId: event.id,
      isAuthenticated: isAuthenticated,
      isRegistered: isRegistered,
      loading: loading
    });

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Nếu đã đăng ký rồi thì không làm gì
    if (isRegistered) {
      console.log('❌ Already registered, skipping');
      return;
    }    setLoading(true);
    setError(null);
    
    try {
      // Debug: Kiểm tra token trước khi đăng ký
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      console.log('Registering for event:', {
        eventId: event.id,
        hasToken: !!token,
        userId: userId,
        tokenLength: token ? token.length : 0
      });

      const response = await eventService.registerForEvent(event.id);

      console.log('Registration response:', {
        eventId: event.id,
        response: response,
        success: response?.success
      });      if (response && response.success) {
        console.log('✅ Registration successful, updating state');
        setIsRegistered(true);
        setHasCheckedRegistration(true);
        setError(null); // Clear any existing errors
          // Cache kết quả thành công với version và userId
        const cacheKey = `event_registration_${event.id}_${localStorage.getItem('userId')}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          isRegistered: true,
          timestamp: Date.now(),
          version: 1,
          userId: localStorage.getItem('userId')
        }));
          if (onRegistrationChange) {
          onRegistrationChange(event.id, true);
        }
        
        // Không cần force reload nữa vì đã có cache và state đã đúng
        console.log('✅ Registration completed successfully, cache updated');
      } else {
        setError(response?.message || 'Đã xảy ra lỗi khi đăng ký tham gia sự kiện');
      }} catch (err) {
      console.error('Registration error:', err);
        // Function để handle đã đăng ký
      const handleAlreadyRegistered = () => {
        console.log('⚠️ User already registered, updating state');
        setIsRegistered(true);
        setHasCheckedRegistration(true);
        setError(null);
          // Cache kết quả với version và userId
        const cacheKey = `event_registration_${event.id}_${localStorage.getItem('userId')}`;
        const cacheData = {
          isRegistered: true,
          timestamp: Date.now(),
          version: 1,
          userId: localStorage.getItem('userId')
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('💾 Cached registration status:', cacheData);
          if (onRegistrationChange) {
          onRegistrationChange(event.id, true);
        }
        
        // Không cần force reload để tránh override state
        console.log('✅ Already registered status updated, cache saved');
      };
      
      let errorMessage = 'Đã xảy ra lỗi khi đăng ký tham gia sự kiện';
      let shouldShowError = true;
      
      console.log('❌ Registration error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        fullError: err
      });
      
      if (err.response?.status === 400 || err.response?.status === 409) {
        // Xử lý trường hợp đã đăng ký (400 hoặc 409)
        const errorMsg = err.response?.data?.message || '';
        
        // Các pattern message cho "đã đăng ký"
        const alreadyRegisteredPatterns = [
          'đã đăng ký',
          'already registered', 
          'đã tham gia',
          'already participated',
          'duplicate registration',
          'registration exists'
        ];
        
        const isAlreadyRegistered = alreadyRegisteredPatterns.some(pattern => 
          errorMsg.toLowerCase().includes(pattern.toLowerCase())
        );
        
        console.log('🔍 Checking if already registered:', {
          errorMsg,
          patterns: alreadyRegisteredPatterns,
          isAlreadyRegistered
        });
        
        if (isAlreadyRegistered) {
          handleAlreadyRegistered();
          shouldShowError = false;
        } else {
          errorMessage = errorMsg || 'Yêu cầu không hợp lệ';
        }
      } else if (err.response?.status === 401) {
        errorMessage = 'Bạn cần đăng nhập để thực hiện thao tác này';
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      // Chỉ set error nếu không phải trường hợp đã đăng ký
      if (shouldShowError) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };// Kiểm tra sự kiện đã kết thúc hay chưa - chỉ dựa vào thời gian
  const now = new Date();
  const eventStartTime = new Date(event.startTime || event.startDate);
  const eventEndTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
  
  // Debug logging
  console.log('Event Debug:', {
    title: event.title,
    startTime: event.startTime || event.startDate,
    endTime: event.endTime || event.endDate,
    now: now.toISOString(),
    eventEndTime: eventEndTime.toISOString(),
    isEndTimePast: eventEndTime < now,
    isStartTimePast: eventStartTime < now
  });
  
  // Sự kiện được coi là đã kết thúc nếu thời gian kết thúc đã qua
  // Nếu không có endTime, sử dụng startTime + 2 giờ làm mặc định
  let effectiveEndTime = eventEndTime;
  if (!event.endTime && !event.endDate) {
    effectiveEndTime = new Date(eventStartTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours
  }
    const isEventPast = effectiveEndTime < now;

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLoginModal(true);
          }}
          className="registration-btn btn-register"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Đăng ký
        </button>
        
        {/* Login Modal */}
        {showLoginModal && (
          <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Yêu cầu đăng nhập</h3>
                <button 
                  type="button"
                  className="modal-close"
                  onClick={() => setShowLoginModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p>Bạn cần đăng nhập để đăng ký tham gia sự kiện này.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowLoginModal(false)}
                >
                  Hủy
                </button>
                <Link 
                  to="/login" 
                  className="btn-primary"
                  onClick={() => setShowLoginModal(false)}
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show loading while checking registration status
  if (checkingStatus || !hasCheckedRegistration) {
    return (
      <div className="registration-btn btn-loading">
        <span className="loading-spinner"></span>
        Đang kiểm tra...
      </div>
    );
  }

  // Đã đăng ký: cho phép hủy đăng ký, và nếu sự kiện đã kết thúc thì cho phép đánh giá
  if (isRegistered) {
    const now = new Date();
    const eventStartTime = new Date(event.startTime || event.startDate);
    const eventEndTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
    let effectiveEndTime = eventEndTime;
    if (!event.endTime && !event.endDate) {
      effectiveEndTime = new Date(eventStartTime.getTime() + 2 * 60 * 60 * 1000);
    }
    const isEventPast = effectiveEndTime < now;

    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="registration-btn btn-registered"
          disabled
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Đã đăng ký
        </button>
        <button
          type="button"
          className="registration-btn btn-cancel"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLoading(true);
            setError(null);
            try {
              await eventService.unregisterFromEvent(event.id);
              setIsRegistered(false);
              setHasCheckedRegistration(true);
              // Xóa cache đăng ký
              const cacheKey = `event_registration_${event.id}_${localStorage.getItem('userId')}`;
              localStorage.removeItem(cacheKey);
              if (onRegistrationChange) {
                onRegistrationChange(event.id, false);
              }
            } catch (err) {
              setError('Hủy đăng ký thất bại. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
        >
          {loading ? 'Đang hủy...' : 'Hủy đăng ký'}
        </button>
        {/* Nút đánh giá luôn hiển thị, nhưng disabled và có thông báo nếu sự kiện chưa kết thúc */}
        <button
          type="button"
          className="registration-btn btn-feedback"
          onClick={() => {
            if (isEventPast) {
              if (onFeedbackClick) {
                onFeedbackClick(event);
              }
            } else {
              window.alert('Bạn chỉ có thể đánh giá sau khi sự kiện kết thúc.');
            }
          }}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Đánh giá sự kiện
        </button>
        {error && (
          <div className="error-message mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Sự kiện đã kết thúc (chưa đăng ký): chỉ hiển thị trạng thái
  if (isEventPast) {
    return (
      <span className="registration-btn btn-completed">
        Đã kết thúc
      </span>
    );
  }

  // Chưa đăng ký: hiển thị nút đăng ký
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        className={`registration-btn btn-register ${loading ? 'btn-loading' : ''}`}
      >
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Đang xử lý...
          </>
        ) : (
          <>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Đăng ký
          </>
        )}
      </button>
      {error && (
        <div className="error-message mt-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

const EventListPage = () => {
  const { isAuthenticated, currentUser, isStaff } = useAuth();
  const [allEvents, setAllEvents] = useState([]); // Lưu tất cả events
  const [events, setEvents] = useState([]); // Events đã filter theo tab
  const [loading, setLoading] = useState(false); // Bỏ loading ban đầu
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  // Staff management states
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [managementMode, setManagementMode] = useState('create');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Function để filter events theo tab (không cần gọi API)
  const filterEventsByTab = useCallback((eventsToFilter, tab) => {
    const now = new Date();
    let filteredEvents = eventsToFilter;
    
    switch (tab) {
      case 'upcoming':
        filteredEvents = eventsToFilter.filter(event => {
          const endTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
          // Nếu không có endTime, thêm 2 giờ vào startTime
          if (!event.endTime && !event.endDate) {
            endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);
          }
          return endTime >= now; // Chưa kết thúc
        })
        // Sắp xếp theo ngày bắt đầu gần nhất
        .sort((a, b) => {
          const aStart = new Date(a.startTime || a.startDate);
          const bStart = new Date(b.startTime || b.startDate);
          return aStart - bStart;
        });
        break;
      case 'past':
        filteredEvents = eventsToFilter.filter(event => {
          const endTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
          if (!event.endTime && !event.endDate) {
            endTime.setTime(endTime.getTime() + 2 * 60 * 60 * 1000);
          }
          return endTime < now; // Đã kết thúc
        });
        break;
      default:
        filteredEvents = eventsToFilter;
    }
    
    return filteredEvents;
  }, []);

  const fetchEvents = async () => {
    // Không set loading = true nữa để không hiển thị loading spinner
    setError(null);
    
    try {
      let response;
      // Lấy tất cả events từ backend
      response = await eventService.getAllEvents();

      if (response && response.success) {
        const eventsData = response.data || [];
        setAllEvents(eventsData); // Lưu tất cả events
        
        // Filter theo tab hiện tại
        const filteredEvents = filterEventsByTab(eventsData, activeTab);
        setEvents(filteredEvents);
      } else {
        setError(response?.message || 'Không thể tải danh sách sự kiện');
      }
    } catch (err) {
      console.error('Error loading events:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đã xảy ra lỗi khi tải danh sách sự kiện');
      }
    }
    // Bỏ finally block vì không cần setLoading(false) nữa
  };

  // Chỉ gọi API một lần khi component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events khi activeTab thay đổi (không gọi lại API)
  useEffect(() => {
    if (allEvents.length > 0) {
      const filteredEvents = filterEventsByTab(allEvents, activeTab);
      setEvents(filteredEvents);
    }
  }, [activeTab, allEvents, filterEventsByTab]);
  const handleRetry = () => {
    setError(null);
    fetchEvents(); // Bỏ setLoading(true)
  };

  const handleFeedbackClick = (event) => {
    setSelectedEventForFeedback(event);
    setIsFeedbackModalOpen(true);
  };
  
  const handleFeedbackSubmitted = () => {
    // Có thể refresh data hoặc show notification
    console.log('Feedback submitted successfully');
  };

  // Staff management functions
  const handleCreateEvent = () => {
    setEventToEdit(null);
    setManagementMode('create');
    setIsManagementModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setManagementMode('edit');
    setIsManagementModalOpen(true);
  };

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await eventService.deleteEvent(eventToDelete.id);
      if (response && response.success) {
        // Remove event from both allEvents and events
        setAllEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
        setEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
        setIsDeleteModalOpen(false);
        setEventToDelete(null);
      } else {
        setError(response?.message || 'Không thể xóa sự kiện');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi xóa sự kiện');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEventSaved = (savedEvent) => {
    if (managementMode === 'create') {
      // Add new event to allEvents
      const newAllEvents = [savedEvent, ...allEvents];
      setAllEvents(newAllEvents);
      // Filter và update events theo tab hiện tại
      const filteredEvents = filterEventsByTab(newAllEvents, activeTab);
      setEvents(filteredEvents);
    } else {
      // Update existing event in allEvents
      const updatedAllEvents = allEvents.map(event => 
        event.id === savedEvent.id ? savedEvent : event
      );
      setAllEvents(updatedAllEvents);
      // Filter và update events theo tab hiện tại
      const filteredEvents = filterEventsByTab(updatedAllEvents, activeTab);
      setEvents(filteredEvents);
    }
  };

  const isEventPast = (event) => {
    const now = new Date();
    const endTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
    
    // Nếu không có endTime, thêm 2 giờ vào startTime
    let effectiveEndTime = endTime;
    if (!event.endTime && !event.endDate) {
      effectiveEndTime = new Date(endTime.getTime() + 2 * 60 * 60 * 1000);
    }
    
    return effectiveEndTime < now;
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateDescription = (description, maxLength = 150) => {
    if (!description) return '';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  };
  
  // Bỏ phần loading screen, chuyển thẳng tới render trang
  return (
    <div className="events-page">
      <EventsBanner />
      <div className="events-container">
        {/* Events Banner Component */}
        {/* <EventsBanner /> */}

        {/* Header */}
        <div className="events-header" style={{ display: 'none' }}>
          <h1>Sự Kiện Cộng Đồng</h1>
          <p>
            Tham gia các hoạt động cộng đồng để xây dựng một xã hội không ma túy
          </p>
        </div>

        {/* Staff Controls */}
        {isStaff() && (
          <div className="staff-controls">
            <div>
              <h3>Quản lý sự kiện</h3>
              <div className="staff-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Staff
              </div>
            </div>
            <div className="staff-actions">
              <button 
                type="button"
                className="btn-create-event"
                onClick={handleCreateEvent}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tạo sự kiện mới
              </button>
            </div>
          </div>
        )}        {/* Navigation Tabs */}
        <div className="events-nav">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'upcoming', label: 'Sắp diễn ra' },
            { key: 'past', label: 'Đã kết thúc' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.key);
              }}
              className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>{/* Error Alert */}
        {error && (
          <div className="error-message">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p>{error}</p>
              <button type="button" onClick={handleRetry} className="text-sm underline mt-1">
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className={`event-card ${isStaff() ? 'staff-view' : ''}`}>
                {/* Event Image */}
                <div className="event-image">
                  {/* Staff Actions */}
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Date Badge */}
                  <div className="event-date-badge">
                    {new Date(event.startTime || event.startDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                    {/* Status Badge - dựa vào thời gian */}
                  <div className={`event-status-badge ${
                    (() => {
                      const now = new Date();
                      const startTime = new Date(event.startTime || event.startDate);
                      const endTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
                      
                      // Nếu không có endTime, thêm 2 giờ vào startTime
                      let effectiveEndTime = endTime;
                      if (!event.endTime && !event.endDate) {
                        effectiveEndTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
                      }
                      
                      if (effectiveEndTime < now) {
                        return 'status-past';
                      } else if (startTime <= now && now <= effectiveEndTime) {
                        return 'status-upcoming'; // Đang diễn ra
                      } else {
                        return 'status-upcoming'; // Sắp diễn ra
                      }
                    })()
                  }`}>
                    {(() => {
                      const now = new Date();
                      const startTime = new Date(event.startTime || event.startDate);
                      const endTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
                      
                      // Nếu không có endTime, thêm 2 giờ vào startTime
                      let effectiveEndTime = endTime;
                      if (!event.endTime && !event.endDate) {
                        effectiveEndTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
                      }
                      
                      if (effectiveEndTime < now) {
                        return 'Đã kết thúc';
                      } else if (startTime <= now && now <= effectiveEndTime) {
                        return 'Đang diễn ra';
                      } else {
                        return 'Sắp diễn ra';
                      }
                    })()}
                  </div>
                </div>
                
                <div className="event-content">
                  {/* Event Title */}
                  <h3 className="event-title">
                    {event.title}
                  </h3>
                  
                  {/* Event Description */}
                  <p className="event-description">
                    {truncateDescription(event.description)}
                  </p>
                  
                  {/* Event Meta Info */}
                  <div className="event-meta">
                    <div className="meta-item">
                      <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.startTime || event.startDate)}
                    </div>
                    
                    {event.location && (
                      <div className="meta-item">
                        <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    )}
                    
                    {event.participantCount !== undefined && (
                      <div className="meta-item">
                        <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {event.participantCount} người tham gia
                      </div>
                    )}

                    {event.creatorName && (
                      <div className="meta-item">
                        <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {event.creatorName}
                      </div>
                    )}
                    
                    {event.onlineLink && (
                      <div className="meta-item">
                        <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Online
                      </div>
                    )}
                  </div>
                    {/* Registration Section */}
                  <div className="registration-section">
                    {event.maxParticipants && (
                      <div className="capacity-info">
                        <span>{event.participantCount || 0}/{event.maxParticipants}</span>
                        <div className="capacity-bar">
                          <div 
                            className="capacity-fill" 
                            style={{
                              width: `${Math.min(100, ((event.participantCount || 0) / event.maxParticipants) * 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Staff Event Statistics */}
                    {isStaff() && (
                      <div className="event-stats">
                        <div className="stat-item">
                          <div className="stat-number">{event.participantCount || 0}</div>
                          <div className="stat-label">Người tham gia</div>
                        </div>
                        {event.maxParticipants && (
                          <div className="stat-item">
                            <div className="stat-number">
                              {Math.round(((event.participantCount || 0) / event.maxParticipants) * 100)}%
                            </div>
                            <div className="stat-label">Tỷ lệ lấp đầy</div>
                          </div>
                        )}
                        <div className="stat-item">
                          <div className="stat-number">
                            {(() => {
                              const now = new Date();
                              const startTime = new Date(event.startTime || event.startDate);
                              const endTime = new Date(event.endTime || event.endDate || event.startTime || event.startDate);
                              
                              let effectiveEndTime = endTime;
                              if (!event.endTime && !event.endDate) {
                                effectiveEndTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
                              }
                              
                              if (effectiveEndTime < now) {
                                return 'Đã kết thúc';
                              } else if (startTime <= now && now <= effectiveEndTime) {
                                return 'Đang diễn ra';
                              } else {
                                const diffTime = Math.abs(startTime - now);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return `${diffDays} ngày`;
                              }
                            })()}
                          </div>
                          <div className="stat-label">Trạng thái</div>
                        </div>
                      </div>
                    )}                    <div className="event-actions">
                      <button 
                        type="button"
                        className="btn-outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Xem chi tiết
                      </button>

                      <EventRegistrationButton 
                        key={`${event.id}-${currentUser?.userId || 'anonymous'}`}
                        event={event} 
                        onRegistrationChange={(eventId, isRegistered) => {
                          // Cập nhật số lượng người tham gia khi đăng ký/hủy đăng ký
                          if (isRegistered) {
                            setEvents(prev => prev.map(e => 
                              e.id === eventId 
                                ? { ...e, participantCount: (e.participantCount || 0) + 1 }
                                : e
                            ));
                          } else {
                            setEvents(prev => prev.map(e => 
                              e.id === eventId && e.participantCount > 0
                                ? { ...e, participantCount: e.participantCount - 1 }
                                : e
                            ));
                          }
                        }}
                        onFeedbackClick={handleFeedbackClick}
                      />

                      {/* Staff Actions - chỉ hiện với role staff và đặt dưới nút đăng ký */}
                      {isStaff() && (
                        <div className="staff-actions-wrapper">
                          <button 
                            type="button"
                            className="btn-outline staff-edit-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Chỉnh sửa
                          </button>
                          
                          <button 
                            type="button"
                            className="btn-outline staff-delete-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteEvent(event);
                            }}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3>Không có sự kiện nào</h3>            <p>
              Hiện tại không có sự kiện nào trong danh mục này.
            </p>
          </div>
        )}
      </div>      {/* Event Detail Modal */}
      <EventDetailModal 
        event={selectedEvent} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
      />

      {/* Staff Management Modals */}
      {isStaff() && (
        <>
          <EventManagementModal
            isOpen={isManagementModalOpen}
            onClose={() => setIsManagementModalOpen(false)}
            eventToEdit={eventToEdit}
            mode={managementMode}
            onEventSaved={handleEventSaved}
          />
          
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDeleteEvent}
            eventTitle={eventToDelete?.title}
            loading={deleteLoading}
          />
        </>
      )}

      {/* Event Feedback Modal */}
      <EventFeedbackModal 
        event={selectedEventForFeedback} 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </div>
  );
};

export default EventListPage;