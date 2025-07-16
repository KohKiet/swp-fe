import React, { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { consultationService } from "../services/consultationService";
import "./AgoraVideoCall.css";

const AgoraVideoCall = ({
  appointmentId,
  agoraAppId,
  agoraChannelName,
  agoraToken,
  agoraExpireAt,
  AgoraAppId,
  AgoraToken,
  ChannelName,
  onCallEnd,
  onError,
}) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStable, setIsStable] = useState(false);
  const [currentToken, setCurrentToken] = useState(
    agoraToken || AgoraToken
  );
  const [currentExpireAt, setCurrentExpireAt] =
    useState(agoraExpireAt);

  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const isInitializedRef = useRef(false);
  const joinAttemptRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isLeavingRef = useRef(false);
  const isMountedRef = useRef(true);
  const instanceIdRef = useRef(Date.now() + Math.random());

  // Use backend field names as fallback
  const finalAppId = agoraAppId;
  const finalChannelName = agoraChannelName;
  const finalToken = currentToken; // Use current token state

  // Helper function to check if token is expired or expiring soon
  const isTokenExpiredOrExpiring = (expireAt, bufferMinutes = 5) => {
    if (!expireAt) return false;
    const expireTime = new Date(expireAt).getTime();
    const currentTime = new Date().getTime();
    const timeUntilExpire = expireTime - currentTime;
    const bufferTime = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds

    return timeUntilExpire <= bufferTime;
  };

  useEffect(() => {
    console.log("AgoraVideoCall mounted with props:", {
      instanceId: instanceIdRef.current,
      appointmentId,
      agoraAppId,
      agoraChannelName,
      hasToken: !!agoraToken,
      agoraExpireAt,
    });

    isMountedRef.current = true;

    // Set stable after short delay to prevent immediate unmounting
    const stabilityTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsStable(true);
      }
    }, 500);

    // Add page visibility change handler to prevent unnecessary unmounting
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page hidden, but keeping component mounted", {
          instanceId: instanceIdRef.current,
        });
      } else {
        console.log("Page visible again", {
          instanceId: instanceIdRef.current,
        });
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    if (!isInitializedRef.current) {
      initAgoraClient();
      isInitializedRef.current = true;
    }

    return () => {
      console.log("AgoraVideoCall cleanup starting...", {
        instanceId: instanceIdRef.current,
        isStable,
        isHidden: document.hidden,
        isJoined,
        isConnecting: isConnectingRef.current,
      });

      isMountedRef.current = false;
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      clearTimeout(stabilityTimer);

      // Always cleanup when component unmounts, regardless of stability
      console.log("AgoraVideoCall unmounting - cleaning up...", {
        instanceId: instanceIdRef.current,
      });
      isLeavingRef.current = true; // Prevent new join attempts during cleanup

      // Force cleanup of all resources
      forceResetAllStates();
    };
  }, []);

  // Auto-join call after initialization and stability
  useEffect(() => {
    let joinTimer = null;

    if (
      isMountedRef.current &&
      clientRef.current &&
      !isJoined &&
      !joinAttemptRef.current &&
      !isConnectingRef.current &&
      !isLeavingRef.current &&
      isStable &&
      finalAppId &&
      finalChannelName &&
      finalToken &&
      !document.hidden // Don't join if page is hidden
    ) {
      console.log("Auto-joining call with credentials:", {
        instanceId: instanceIdRef.current,
        finalAppId: !!finalAppId,
        finalChannelName: !!finalChannelName,
        finalToken: !!finalToken,
        isStable,
        isConnecting: isConnectingRef.current,
        isLeaving: isLeavingRef.current,
        isMounted: isMountedRef.current,
        isHidden: document.hidden,
      });

      joinAttemptRef.current = true;
      isConnectingRef.current = true;

      // Delay join slightly to ensure component is stable
      joinTimer = setTimeout(() => {
        if (isMountedRef.current && !document.hidden && !isJoined) {
          joinCall();
        } else {
          // Reset flags if component unmounted during delay or page became hidden
          isConnectingRef.current = false;
          joinAttemptRef.current = false;
          console.log(
            "Join cancelled - component unmounted, page hidden, or already joined",
            {
              instanceId: instanceIdRef.current,
              isMounted: isMountedRef.current,
              isHidden: document.hidden,
              isJoined,
            }
          );
        }
      }, 1000);
    }

    return () => {
      if (joinTimer) {
        clearTimeout(joinTimer);
        // Reset flags if effect cleanup happens before join
        if (!isMountedRef.current || document.hidden) {
          isConnectingRef.current = false;
          joinAttemptRef.current = false;
        }
      }
    };
  }, [
    clientRef.current,
    finalAppId,
    finalChannelName,
    finalToken,
    isStable,
    isJoined,
  ]);

  useEffect(() => {
    // Check if token needs refresh
    if (currentExpireAt && isJoined) {
      const expireTime = new Date(currentExpireAt).getTime();
      const currentTime = new Date().getTime();
      const timeUntilExpire = expireTime - currentTime;

      console.log(
        "Token check - time until expire:",
        timeUntilExpire / 1000 / 60,
        "minutes"
      );

      // Refresh token 5 minutes before expiry
      if (timeUntilExpire > 0 && timeUntilExpire < 5 * 60 * 1000) {
        console.log("Token expiring soon, refreshing...");
        refreshToken();
      }
    }
  }, [currentExpireAt, isJoined]);

  // Update current token when props change
  useEffect(() => {
    const newToken = agoraToken || AgoraToken;
    if (newToken && newToken !== currentToken) {
      console.log("Token props updated, updating current token");
      setCurrentToken(newToken);
      setCurrentExpireAt(agoraExpireAt);
    }
  }, [agoraToken, AgoraToken, agoraExpireAt]);

  const initAgoraClient = () => {
    try {
      if (clientRef.current) {
        console.log(
          "Agora client already exists, skipping initialization",
          { instanceId: instanceIdRef.current }
        );
        return;
      }

      console.log("Initializing Agora client...", {
        instanceId: instanceIdRef.current,
      });
      clientRef.current = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      // Set up event listeners
      clientRef.current.on("user-published", handleUserPublished);
      clientRef.current.on("user-unpublished", handleUserUnpublished);
      clientRef.current.on("user-left", handleUserLeft);
      clientRef.current.on(
        "token-privilege-will-expire",
        refreshToken
      );
      clientRef.current.on(
        "token-privilege-did-expire",
        handleTokenExpired
      );

      console.log("Agora client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Agora client:", error);
      setError("Không thể khởi tạo video call: " + error.message);
      if (onError) onError(error);
    }
  };

  const refreshToken = async () => {
    try {
      console.log("Refreshing Agora token...");
      const response = await consultationService.refreshAgoraToken(
        appointmentId
      );

      console.log(
        "Token refresh response:",
        JSON.stringify(response, null, 2)
      );

      if (response.success && response.data) {
        let newToken, newExpireAt;

        // Handle different response formats
        if (response.data.agoraToken) {
          newToken = response.data.agoraToken;
          newExpireAt = response.data.agoraExpireAt;
          console.log("Using agoraToken format");
        } else if (response.data.token) {
          // Handle the actual backend response format
          newToken = response.data.token;
          newExpireAt = response.data.expireAt || null;
          console.log(
            "Using backend token format (response.data.token)"
          );
        } else if (response.data.AgoraToken) {
          newToken = response.data.AgoraToken;
          newExpireAt = response.data.AgoraExpireAt;
          console.log("Using AgoraToken format");
        } else if (typeof response.data === "string") {
          // Handle case where token is returned as string
          newToken = response.data;
          newExpireAt = null;
          console.log("Using string token format");
        } else {
          console.error("Unknown response format:", response);
          throw new Error(
            "Invalid response format from token refresh API"
          );
        }

        if (newToken) {
          // Update state with new token
          setCurrentToken(newToken);
          setCurrentExpireAt(newExpireAt);

          // If already joined, renew the token with Agora
          if (clientRef.current && isJoined) {
            await clientRef.current.renewToken(newToken);
          }

          console.log("Token refreshed successfully", {
            newExpireAt,
            timeUntilExpire: newExpireAt
              ? (new Date(newExpireAt).getTime() -
                  new Date().getTime()) /
                1000 /
                60
              : "unknown",
          });

          return newToken;
        }
      }

      throw new Error(
        "Failed to get new token: " +
          (response.error || "Unknown error")
      );
    } catch (error) {
      console.error("Failed to refresh token:", error);

      // Handle specific error cases
      if (error.message && error.message.includes("404")) {
        setError(
          "Backend không hỗ trợ làm mới token. Vui lòng đóng và mở lại video call."
        );
      } else if (error.message && error.message.includes("401")) {
        setError(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else {
        setError(
          "Không thể làm mới token video call: " + error.message
        );
      }

      if (onError) onError(error);
      return null; // Return null instead of throwing
    }
  };

  const handleTokenExpired = () => {
    console.log(
      "Token expired event received, attempting to refresh..."
    );
    refreshToken().catch((error) => {
      console.error("Failed to handle token expiration:", error);
      setError(
        "Token đã hết hạn và không thể làm mới. Vui lòng đóng và mở lại video call."
      );
    });
  };

  const handleUserPublished = async (user, mediaType) => {
    try {
      console.log("User published:", user.uid, mediaType);
      await clientRef.current.subscribe(user, mediaType);
      console.log("Subscribed to user:", user.uid, mediaType);

      if (mediaType === "video") {
        setRemoteUsers((prev) => {
          const existingUser = prev.find((u) => u.uid === user.uid);
          if (existingUser) {
            return prev.map((u) =>
              u.uid === user.uid
                ? { ...u, videoTrack: user.videoTrack }
                : u
            );
          }
          return [
            ...prev,
            {
              uid: user.uid,
              videoTrack: user.videoTrack,
              audioTrack: null,
            },
          ];
        });
      }

      if (mediaType === "audio") {
        user.audioTrack.play();
        setRemoteUsers((prev) => {
          const existingUser = prev.find((u) => u.uid === user.uid);
          if (existingUser) {
            return prev.map((u) =>
              u.uid === user.uid
                ? { ...u, audioTrack: user.audioTrack }
                : u
            );
          }
          return [
            ...prev,
            {
              uid: user.uid,
              videoTrack: null,
              audioTrack: user.audioTrack,
            },
          ];
        });
      }
    } catch (error) {
      console.error("Failed to subscribe to user:", error);
      setError(
        "Không thể kết nối với người dùng khác: " + error.message
      );
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    console.log("User unpublished:", user.uid, mediaType);

    setRemoteUsers((prev) =>
      prev.map((u) => {
        if (u.uid === user.uid) {
          if (mediaType === "video") {
            return { ...u, videoTrack: null };
          }
          if (mediaType === "audio") {
            return { ...u, audioTrack: null };
          }
        }
        return u;
      })
    );
  };

  const handleUserLeft = (user) => {
    console.log("User left:", user.uid);
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  };

  const joinCall = async () => {
    if (!isMountedRef.current) {
      console.log("Component unmounted, skipping join attempt", {
        instanceId: instanceIdRef.current,
      });
      isConnectingRef.current = false;
      joinAttemptRef.current = false;
      return;
    }

    if (document.hidden) {
      console.log("Page is hidden, skipping join attempt", {
        instanceId: instanceIdRef.current,
      });
      isConnectingRef.current = false;
      joinAttemptRef.current = false;
      return;
    }

    console.log("Attempting to join call", {
      instanceId: instanceIdRef.current,
      hasAppId: !!finalAppId,
      hasChannelName: !!finalChannelName,
      hasToken: !!finalToken,
      isHidden: document.hidden,
    });

    if (!finalAppId || !finalChannelName) {
      const errorMsg = "Thiếu thông tin cấu hình video call";
      console.error("Missing video call configuration:", {
        instanceId: instanceIdRef.current,
        hasAppId: !!finalAppId,
        hasChannelName: !!finalChannelName,
        hasToken: !!finalToken,
      });
      setError(errorMsg);
      isConnectingRef.current = false;
      joinAttemptRef.current = false;
      return;
    }

    // Check if we're already connected
    if (isJoined) {
      console.log("Already joined, skipping join attempt", {
        instanceId: instanceIdRef.current,
      });
      return;
    }

    // Check if we're stuck in connecting state for too long
    if (isConnectingRef.current) {
      const stuckTime =
        Date.now() - (window.lastJoinAttempt || Date.now());
      if (stuckTime > 15000) {
        // 15 seconds timeout
        console.log(
          "Detected stuck connecting state, forcing reset",
          {
            instanceId: instanceIdRef.current,
            stuckTime,
          }
        );
        forceResetAllStates();
        // Try joining again after a short delay
        setTimeout(() => {
          if (isMountedRef.current) {
            console.log("Retrying join after force reset", {
              instanceId: instanceIdRef.current,
            });
            joinCall();
          }
        }, 1000);
        return;
      } else {
        console.log(
          "Still in connecting state, skipping join attempt",
          {
            instanceId: instanceIdRef.current,
            stuckTime,
          }
        );
        return;
      }
    }

    // Check if client is already in connecting/connected state
    if (clientRef.current) {
      const connectionState = clientRef.current.connectionState;
      console.log(
        "Current client connection state:",
        connectionState,
        { instanceId: instanceIdRef.current }
      );

      if (
        connectionState === "CONNECTING" ||
        connectionState === "CONNECTED"
      ) {
        console.log(
          "Client already connecting/connected, skipping join attempt",
          { instanceId: instanceIdRef.current }
        );
        isConnectingRef.current = false;
        joinAttemptRef.current = false;
        return;
      }
    }

    setIsLoading(true);
    setError("");
    isConnectingRef.current = true;

    // Track join attempt timestamp
    window.lastJoinAttempt = Date.now();
    console.log(
      "Join attempt started at:",
      new Date(window.lastJoinAttempt).toISOString(),
      {
        instanceId: instanceIdRef.current,
      }
    );

    // Add a timeout to reset connecting state if join takes too long
    const connectionTimeout = setTimeout(() => {
      if (isConnectingRef.current && !isJoined) {
        console.log(
          "Connection timeout, resetting connecting state",
          {
            instanceId: instanceIdRef.current,
          }
        );
        isConnectingRef.current = false;
        joinAttemptRef.current = false;
        setIsLoading(false);
        setError("Kết nối video call bị timeout. Vui lòng thử lại.");
      }
    }, 30000); // 30 second timeout

    try {
      // Check device availability first
      console.log("Checking device availability before joining...");
      try {
        await checkDeviceAvailability();
        console.log("Device availability check passed");
      } catch (deviceError) {
        console.error(
          "Device availability check failed:",
          deviceError
        );
        setError(deviceError.message);
        isConnectingRef.current = false;
        joinAttemptRef.current = false;
        return;
      }

      // Check if token is expired or expiring soon and refresh if needed
      let tokenToUse = finalToken;
      if (!tokenToUse || isTokenExpiredOrExpiring(currentExpireAt)) {
        console.log(
          "Token is expired or expiring soon, refreshing..."
        );
        try {
          tokenToUse = await refreshToken();
          if (!tokenToUse) {
            setError(
              "Không thể làm mới token. Vui lòng thử lại sau."
            );
            isConnectingRef.current = false;
            joinAttemptRef.current = false;
            return;
          }
        } catch (refreshError) {
          console.error(
            "Failed to refresh token before joining:",
            refreshError
          );
          setError(
            "Token đã hết hạn và không thể làm mới. Vui lòng thử lại sau."
          );
          isConnectingRef.current = false;
          joinAttemptRef.current = false;
          return;
        }
      }

      if (!tokenToUse) {
        setError("Không có token hợp lệ để tham gia video call");
        isConnectingRef.current = false;
        joinAttemptRef.current = false;
        return;
      }

      console.log("Creating local tracks...");
      // Create local tracks with better error handling
      let audioTrack, videoTrack;

      try {
        // First try to create both audio and video tracks
        [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        console.log(
          "Both audio and video tracks created successfully"
        );
      } catch (trackError) {
        console.error("Failed to create tracks:", trackError);

        // Check if it's a permission error
        if (
          trackError.message &&
          trackError.message.includes("Permission denied")
        ) {
          setError(
            "❌ Không thể truy cập camera/microphone\n\n" +
              "Vui lòng:\n" +
              "1. Cho phép truy cập camera và microphone trong trình duyệt\n" +
              "2. Kiểm tra xem có ứng dụng nào đang sử dụng camera không\n" +
              "3. Thử làm mới trang và thử lại\n\n" +
              "Chi tiết lỗi: " +
              trackError.message
          );
          isConnectingRef.current = false;
          joinAttemptRef.current = false;
          return;
        }

        // Try creating audio-only track if video fails
        try {
          console.log("Trying to create audio-only track...");
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          videoTrack = null;
          console.log("Audio-only track created successfully");
          setError(
            "⚠️ Không thể truy cập camera\n\n" +
              "Cuộc gọi sẽ tiếp tục với âm thanh chỉ.\n" +
              "Vui lòng kiểm tra quyền truy cập camera và thử lại.\n\n" +
              "Chi tiết lỗi: " +
              trackError.message
          );
        } catch (audioError) {
          console.error("Failed to create audio track:", audioError);
          setError(
            "❌ Không thể truy cập camera và microphone\n\n" +
              "Vui lòng kiểm tra:\n" +
              "1. Quyền truy cập camera/microphone trong trình duyệt\n" +
              "2. Thiết bị có camera/microphone không\n" +
              "3. Không có ứng dụng nào đang sử dụng camera/microphone\n\n" +
              "Chi tiết lỗi: " +
              trackError.message
          );
          isConnectingRef.current = false;
          joinAttemptRef.current = false;
          return;
        }
      }

      console.log("Local tracks created successfully", {
        hasAudio: !!audioTrack,
        hasVideo: !!videoTrack,
      });
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // Play local video if available
      if (localVideoRef.current && videoTrack) {
        try {
          videoTrack.play(localVideoRef.current);
          console.log("Local video playing successfully");
        } catch (playError) {
          console.error("Failed to play local video:", playError);
          setError(
            "⚠️ Không thể hiển thị video local\n\n" +
              "Cuộc gọi sẽ tiếp tục nhưng bạn không thể thấy video của mình.\n\n" +
              "Chi tiết lỗi: " +
              playError.message
          );
        }
      } else if (!videoTrack) {
        console.log(
          "No video track available, showing audio-only message"
        );
        setError(
          "📞 Cuộc gọi audio-only\n\n" +
            "Camera không khả dụng, cuộc gọi sẽ chỉ có âm thanh."
        );
      }

      console.log("Joining channel with:", {
        appId: finalAppId,
        channel: finalChannelName,
        hasToken: !!tokenToUse,
        tokenExpiry: currentExpireAt,
      });

      // Join channel with potentially refreshed token
      const uid = await clientRef.current.join(
        finalAppId,
        finalChannelName,
        tokenToUse
      );
      console.log("Joined channel successfully with UID:", uid);

      await clientRef.current.publish([audioTrack, videoTrack]);
      console.log("Published local tracks successfully");

      setIsJoined(true);
      isConnectingRef.current = false;
      joinAttemptRef.current = false;
      console.log("Successfully joined video call");
    } catch (error) {
      console.error("Failed to join call:", error);
      isConnectingRef.current = false;
      joinAttemptRef.current = false;

      // Check for specific Agora errors and handle token expiration
      let userFriendlyError =
        "Không thể tham gia video call: " + error.message;

      if (
        error.message &&
        (error.message.includes("dynamic key expired") ||
          error.message.includes("CAN_NOT_GET_GATEWAY_SERVER") ||
          error.message.includes("token") ||
          error.message.includes("invalid token"))
      ) {
        console.log(
          "Token expired during join, attempting refresh..."
        );
        try {
          const newToken = await refreshToken();
          if (newToken) {
            // Reset join attempt flag and try again
            joinAttemptRef.current = false;
            setIsLoading(false);
            setTimeout(() => joinCall(), 1000); // Retry after 1 second
            return;
          } else {
            console.log("Token refresh returned null, cannot retry");
            userFriendlyError =
              "Token video call đã hết hạn và không thể làm mới. Vui lòng đóng và mở lại video call.";
          }
        } catch (refreshError) {
          console.error(
            "Failed to refresh expired token:",
            refreshError
          );
          userFriendlyError =
            "Token video call đã hết hạn và không thể làm mới. Vui lòng đóng và mở lại video call.";
        }
      } else if (
        (error.message &&
          error.message.includes("invalid vendor key")) ||
        error.message.includes("can not find appid")
      ) {
        userFriendlyError =
          "⚠️ Cấu hình Agora không hợp lệ\n\n" +
          "Lỗi: Backend đang sử dụng App ID không tồn tại trong hệ thống Agora.\n\n" +
          "Chi tiết kỹ thuật:\n" +
          `• App ID: ${finalAppId}\n` +
          `• Lỗi: ${error.message}\n\n` +
          "Vui lòng liên hệ bộ phận kỹ thuật để cập nhật cấu hình Agora chính xác.";
      } else if (
        error.message &&
        error.message.includes("Permission denied")
      ) {
        userFriendlyError =
          "Cần cấp quyền truy cập camera và microphone để tham gia video call.";
      }

      setError(userFriendlyError);

      if (onError) onError(error);
    } finally {
      setIsLoading(false);
      clearTimeout(connectionTimeout); // Clear the timeout on completion or error
    }
  };

  const leaveCall = async () => {
    if (isLeavingRef.current) {
      console.log("Already leaving call, skipping...");
      return;
    }

    isLeavingRef.current = true;

    try {
      console.log("Leaving call...");

      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      if (localVideoTrack) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }

      if (clientRef.current && isJoined) {
        await clientRef.current.leave();
        console.log("Left channel successfully");
      }

      setRemoteUsers([]);
      setIsJoined(false);
      isConnectingRef.current = false;
      joinAttemptRef.current = false;

      if (onCallEnd) onCallEnd();
    } catch (error) {
      console.error("Failed to leave call:", error);
    } finally {
      isLeavingRef.current = false;
    }
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
      console.log("Audio", isMuted ? "enabled" : "disabled");
    }
  };

  const toggleCamera = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isCameraOff);
      setIsCameraOff(!isCameraOff);
      console.log("Video", isCameraOff ? "enabled" : "disabled");
    }
  };

  const resetConnectionState = () => {
    console.log("Manually resetting connection state", {
      instanceId: instanceIdRef.current,
      wasConnecting: isConnectingRef.current,
      wasJoined: isJoined,
      wasLeaving: isLeavingRef.current,
    });
    isConnectingRef.current = false;
    joinAttemptRef.current = false;
    isLeavingRef.current = false;
    setIsLoading(false);
    setError("");
  };

  // Force reset all connection states - more aggressive reset
  const forceResetAllStates = () => {
    console.log("Force resetting all connection states", {
      instanceId: instanceIdRef.current,
    });

    // Reset all refs
    isConnectingRef.current = false;
    joinAttemptRef.current = false;
    isLeavingRef.current = false;
    isInitializedRef.current = false;

    // Reset all states
    setIsJoined(false);
    setIsLoading(false);
    setError("");

    // Close any existing tracks
    if (localAudioTrack) {
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
    if (localVideoTrack) {
      localVideoTrack.close();
      setLocalVideoTrack(null);
    }

    // Leave channel if connected
    if (clientRef.current) {
      clientRef.current.leave().catch((err) => {
        console.log("Error leaving channel during force reset:", err);
      });
    }

    console.log("All states force reset completed");
  };

  const checkDeviceAvailability = async () => {
    try {
      console.log("Checking device availability...");

      // Check if getUserMedia is supported
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Trình duyệt không hỗ trợ truy cập camera/microphone"
        );
      }

      // Check camera availability
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoStream.getTracks().forEach((track) => track.stop());
      console.log("Camera is available");

      // Check microphone availability
      const audioStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      audioStream.getTracks().forEach((track) => track.stop());
      console.log("Microphone is available");

      return { camera: true, microphone: true };
    } catch (error) {
      console.error("Device availability check failed:", error);

      if (error.name === "NotAllowedError") {
        throw new Error(
          "Quyền truy cập camera/microphone bị từ chối. Vui lòng cho phép trong trình duyệt."
        );
      } else if (error.name === "NotFoundError") {
        throw new Error(
          "Không tìm thấy camera hoặc microphone. Vui lòng kiểm tra thiết bị."
        );
      } else if (error.name === "NotReadableError") {
        throw new Error(
          "Camera/microphone đang được sử dụng bởi ứng dụng khác."
        );
      } else {
        throw new Error(
          "Không thể kiểm tra thiết bị: " + error.message
        );
      }
    }
  };

  // Debug information
  console.log("Current state:", {
    hasAppId: !!finalAppId,
    hasChannelName: !!finalChannelName,
    hasToken: !!finalToken,
    tokenExpiry: currentExpireAt,
    isTokenExpired: currentExpireAt
      ? isTokenExpiredOrExpiring(currentExpireAt, 0)
      : "unknown",
    isTokenExpiringSoon: currentExpireAt
      ? isTokenExpiredOrExpiring(currentExpireAt, 5)
      : "unknown",
    isJoined,
    remoteUsersCount: remoteUsers.length,
    error,
  });

  if (!finalAppId || !finalChannelName) {
    return (
      <div className="video-call-error">
        <p>Video call chưa được cấu hình cho cuộc hẹn này.</p>
        <small>
          Debug: AppId: {finalAppId ? "✓" : "✗"}, Channel:{" "}
          {finalChannelName ? "✓" : "✗"}
        </small>
      </div>
    );
  }

  return (
    <div className="agora-video-call">
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button
            onClick={() => setError("")}
            className="btn btn-secondary btn-small">
            Đóng
          </button>
        </div>
      )}

      <div className="video-container">
        {/* Local Video */}
        <div className="local-video">
          <div
            ref={localVideoRef}
            className="video-player local-player"></div>
          <span className="video-label">Bạn</span>
        </div>

        {/* Remote Videos */}
        {remoteUsers.map((user) => (
          <RemoteVideoPlayer key={user.uid} user={user} />
        ))}

        {remoteUsers.length === 0 && isJoined && (
          <div className="waiting-message">
            <p>Đang chờ chuyên gia tham gia...</p>
          </div>
        )}
      </div>

      <div className="video-controls">
        {!isJoined ? (
          <div className="join-controls">
            <button
              onClick={joinCall}
              disabled={isLoading || isConnectingRef.current}
              className="btn btn-primary">
              {isLoading || isConnectingRef.current
                ? "Đang tham gia..."
                : "Tham gia Video Call"}
            </button>

            {/* Manual join button that bypasses auto-join */}
            <button
              onClick={() => {
                console.log("Manual join triggered", {
                  instanceId: instanceIdRef.current,
                });
                // Reset flags to allow manual join
                isConnectingRef.current = false;
                joinAttemptRef.current = false;
                joinCall();
              }}
              disabled={isLoading}
              className="btn btn-primary btn-small">
              Tham gia thủ công
            </button>

            {/* Show reset button if stuck in connecting state */}
            {isConnectingRef.current && !isLoading && (
              <button
                onClick={resetConnectionState}
                className="btn btn-warning btn-small">
                Làm mới kết nối
              </button>
            )}

            {/* Show force reset button for severe stuck states */}
            {isConnectingRef.current && !isJoined && (
              <button
                onClick={forceResetAllStates}
                className="btn btn-danger btn-small">
                Khởi động lại hoàn toàn
              </button>
            )}

            {/* Manual reset button for any state */}
            <button
              onClick={forceResetAllStates}
              className="btn btn-secondary btn-small">
              Làm mới hoàn toàn
            </button>

            {/* Debug button to show current state */}
            <button
              onClick={() => {
                const debugInfo = {
                  instanceId: instanceIdRef.current,
                  isJoined,
                  isConnecting: isConnectingRef.current,
                  isLeaving: isLeavingRef.current,
                  isMounted: isMountedRef.current,
                  hasLocalAudio: !!localAudioTrack,
                  hasLocalVideo: !!localVideoTrack,
                  clientState: clientRef.current?.connectionState,
                  hasAppId: !!finalAppId,
                  hasChannelName: !!finalChannelName,
                  hasToken: !!finalToken,
                  stuckTime: window.lastJoinAttempt
                    ? Date.now() - window.lastJoinAttempt
                    : 0,
                };
                console.log("Debug Info:", debugInfo);
                alert(`Debug Info:
Instance ID: ${debugInfo.instanceId}
Is Joined: ${debugInfo.isJoined}
Is Connecting: ${debugInfo.isConnecting}
Is Leaving: ${debugInfo.isLeaving}
Is Mounted: ${debugInfo.isMounted}
Has Local Audio: ${debugInfo.hasLocalAudio}
Has Local Video: ${debugInfo.hasLocalVideo}
Client State: ${debugInfo.clientState}
Has App ID: ${debugInfo.hasAppId}
Has Channel Name: ${debugInfo.hasChannelName}
Has Token: ${debugInfo.hasToken}
Stuck Time: ${debugInfo.stuckTime}ms`);
              }}
              className="btn btn-info btn-small">
              Debug Info
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`btn ${
                isMuted ? "btn-danger" : "btn-secondary"
              }`}>
              {isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            </button>

            <button
              onClick={toggleCamera}
              className={`btn ${
                isCameraOff ? "btn-danger" : "btn-secondary"
              }`}>
              {isCameraOff ? "Bật camera" : "Tắt camera"}
            </button>

            <button onClick={leaveCall} className="btn btn-danger">
              Kết thúc cuộc gọi
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const RemoteVideoPlayer = ({ user }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current);
      console.log("Playing remote video for user:", user.uid);
    }
  }, [user.videoTrack]);

  return (
    <div className="remote-video">
      <div
        ref={videoRef}
        className="video-player remote-player"></div>
      <span className="video-label">Chuyên gia</span>
    </div>
  );
};

export default AgoraVideoCall;
