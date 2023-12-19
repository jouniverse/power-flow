function sum(arr)
{
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

function mean(arr)
{
  return sum(arr)/arr.length;
}

function median(arr)
{
  const mid = Math.floor(arr.length / 2),
  nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;  
}

function roundTo(number, precision) {
  return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
}

// export {sum, mean, median, roundTo};