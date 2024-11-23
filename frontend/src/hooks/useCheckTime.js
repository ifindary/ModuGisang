const useCheckTime = () => {
  const checkTime = (startDate, wakeTime) => {
    const result = {
      isTooEarly: false,
      isTooLate: false,
      remainingTime: -1,
      diffDays: null,
    };
    if (startDate === undefined || wakeTime === undefined) return result;

    const now = new Date();
    const startDateDate = new Date(startDate);

    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateNormalized = new Date(
      startDateDate.getFullYear(),
      startDateDate.getMonth(),
      startDateDate.getDate(),
    );

    // 현재 날짜가 시작일보다 이전인 경우 날짜만 비교하여 return
    if (nowDate < startDateNormalized) {
      const diffTime = startDateDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return { ...result, diffDays };
    }

    // 현재 날짜가 시작일 당일이거나 이후인 경우, 시간을 비교
    const wakeTimeDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // 다음 날 자정
      0,
      0,
      0,
      0,
    );

    const [hours, minutes, seconds] = wakeTime.split(':')?.map(Number);
    wakeTimeDate.setHours(hours, minutes, seconds, 0, 0, 0);

    // isTooEarly: 현재가 wakeTime의 10분 전보다 더 일찍인 경우
    const isTooEarly = now.getTime() < wakeTimeDate.getTime() - 600000;

    // isTooLate: 현재 시각이 wakeTime으로부터 3초가 지나고, 오늘 자정이 지나지 않은 경우 true
    const isTooLate =
      now.getTime() > wakeTimeDate.getTime() + 3000 &&
      now.getTime() < midnight.getTime();

    const remainingTime = wakeTimeDate.getTime() - now.getTime();

    result.isTooEarly = isTooEarly;
    result.isTooLate = isTooLate;
    result.remainingTime = remainingTime;

    return result;
  };

  return { checkTime };
};

export default useCheckTime;
