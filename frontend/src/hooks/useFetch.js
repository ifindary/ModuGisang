import { useNavigate } from 'react-router-dom';

const useFetch = () => {
  const navigate = useNavigate();

  const fetchData = async callback => {
    const callResponse = {
      isLoading: true,
      status: null,
      data: null,
      error: null,
    };

    if (!navigator.onLine) {
      navigate('/offline');
      return;
    }

    try {
      const response = await callback();

      callResponse.data = response.data;
      callResponse.status = response.status;
      callResponse.error = null;
    } catch (error) {
      if (!navigator.onLine) {
        navigate('/offline');
        return;
      } else {
        const message =
          error.response?.data?.message ||
          error.response?.data ||
          error.message;
        callResponse.data = null;
        callResponse.status = error.response?.status;
        callResponse.error = message;
      }
    } finally {
      callResponse.isLoading = false;
      return callResponse;
    }
  };

  return { fetchData };
};

export default useFetch;
