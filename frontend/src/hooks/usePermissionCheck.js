import { Dialog } from '@capacitor/dialog';
import { AppLauncher } from '@capacitor/app-launcher';

const openAppSettings = async () => {
  try {
    const { value } = await AppLauncher.canOpenUrl({ url: 'app-settings:' });
    if (value) {
      await AppLauncher.openUrl({
        url: 'app-settings:root=app.modugisang.site',
      });
    } else {
      console.log('Cannot open settings');
      alert('설정 앱을 열 수 없습니다. 직접 설정에서 권한을 변경해주세요.');
    }
  } catch (error) {
    console.error('Error opening settings:', error);
  }
};

const usePermissionCheck = () => {
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      // 권한이 부여된 경우
      console.log('Microphone permission granted');
      // 스트림을 사용하지 않을 경우 즉시 중지하여 리소스를 해제합니다.
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.log('Microphone permission denied');
        await showPermissionAlert('마이크');
      } else {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log('Camera permission granted');
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        console.log('Camera permission denied');
        await showPermissionAlert('카메라');
      } else {
        console.error('Error accessing camera:', error);
      }
    }
  };

  const showPermissionAlert = async permissionType => {
    const result = await Dialog.confirm({
      title: `${permissionType} 권한 필요`,
      message: `${permissionType} 권한을 허용하지 않으면 어플리케이션을 사용하기 어렵습니다. 설정에서 권한을 허용해주세요.`,
      okButtonTitle: '설정으로 이동',
      cancelButtonTitle: '취소',
    });

    if (result.value) {
      // 설정 페이지로 이동
      openAppSettings();
    }
  };

  return { requestMicrophonePermission, requestCameraPermission };
};

export default usePermissionCheck;
