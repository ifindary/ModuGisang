import { useNavigate } from 'react-router-dom';

const useHandleError = () => {
  const navigate = useNavigate();

  const handleError = (error, status) => {
    // 백엔더에서 넘겨준 메시지 그대로 얼럿으로 노출
    alert(error);

    // 500 에러인 경우 에러 페이지로 이동
    if (status == 500) {
      navigate('/error', { state: { errorCode: status } });
    }
    return;
  };

  return handleError;
};

export default useHandleError;
