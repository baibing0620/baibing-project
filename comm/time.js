
//秒数  转换为 天时分秒等
export function secondFormat(second) {
  // 天数位
  var day = Math.floor(second / 24 / 3600);

  // 小时位
  var hr = Math.floor((second - day * 24 * 3600) / 3600);
  // 分钟位
  var min = Math.floor((second - day * 24 * 3600 - hr * 3600) / 60);
  // 秒位
  var sec = (second - day * 24 * 3600 - hr * 3600 - min * 60); // 

  if (day > 0) {
    return setnum(day) + ' 天 ' + setnum(hr) + ":" + setnum(min) + ":" + setnum(sec);
  }
  else {
    return setnum(hr) + ":" + setnum(min) + ":" + setnum(sec);
  }

};
// 格式数字为两位  如 1 显示为01
function setnum(num) {
  if (num < 10) {
    num = '0' + num;
  }
  return num;
};

export function cutdownTime(nowTime, times) {
  let finishAll = true;
  let spareTime = 0;
  for (var i = 0; i < times.length; i++) {
    if (nowTime < times[i].timestart) {
      finishAll = false;
      spareTime = times[i].timestart - nowTime;
      times[i].timeShown = '距秒杀开始还有：' + secondFormat(spareTime);
      times[i].timeActive = 'bc-c';
        times[i].timeType = 1
        secondFormat2(spareTime, times[i])
    } else {
      if (nowTime < times[i].timeend) {
        finishAll = false;
        spareTime = times[i].timeend - nowTime;
        times[i].timeShown = '距秒杀结束还有：' + secondFormat(spareTime);
        times[i].timeActive = 'bc-danger';
        times[i].timeType = 2
        secondFormat2(spareTime, times[i])
      } else {
        times[i].timeShown = '秒杀已经结束';
        times[i].timeActive = 'bc-c';
        times[i].timeType = 3
        secondFormat2(spareTime, times[i])
      }
    }
  }
  return finishAll;
}


function secondFormat2(second, item) {
    // 天数位
    var day = Math.floor(second / 24 / 3600);

    // 小时位
    var hr = Math.floor((second - day * 24 * 3600) / 3600);
    // 分钟位
    var min = Math.floor((second - day * 24 * 3600 - hr * 3600) / 60);
    // 秒位
    var sec = (second - day * 24 * 3600 - hr * 3600 - min * 60); // 
    if (day == 0 && hr == 0 && min <= 5) {
        item.hasRemind = false
    }
    if (day > 0) {
        item.day = day
    }
    item.hr = setnum(hr);
    item.min = setnum(min);
    item.sec = setnum(sec);

};


export function cutdownTime2(nowTime, times) {
    let finishAll = true;
    let spareTime = 0;
    for (var i = 0; i < times.length; i++) {
        let endTime = parseInt(new Date(times[i].end_time.replace(/-/g, "/")).getTime() / 1000);
        if (nowTime < endTime) {
            finishAll = false;
            times[i].type = 1
            spareTime = endTime - nowTime;
            times[i].timeShown = '剩余：' + secondFormat(spareTime);
            secondFormat2(spareTime, times[i])
        } else {
            times[i].timeShown = '拼团已经结束';
            times[i].type = 2;
        }
    }
    return finishAll;
}

export function cutdownTime3(nowTime, times) {
    let finishAll = true;
    let spareTime = 0;
    for (var i = 0; i < times.length; i++) {
        if (nowTime < times[i].timeend) {
            finishAll = false;
            times[i].type = 1
            spareTime = times[i].timeend - nowTime;
            times[i].timeShown = '剩余：' + secondFormat(spareTime);
            secondFormat2(spareTime, times[i])
        } else {
            times[i].type = -1
            times[i].timeShown = '砍价已经结束';
        }
    }
    return finishAll;
}

export function cutdownTime4(nowTime, times) {
    let finishAll = true;
    let spareTime = 0;
    for (var i = 0; i < times.length; i++) {
        if (nowTime < times[i].timeend) {
            times[i].type = 1
            finishAll = false;
            spareTime = times[i].timeend - nowTime;
            secondFormat2(spareTime, times[i])
        } else {
            times[i].type = 2;
        }
    }
    return finishAll;
}
export function cutdownTime5(nowTime, times) {
    let finishAll = true;
    let spareTime = 0;
    for (var i = 0; i < times.length; i++) {
        if (nowTime < times[i].timestart) {
            finishAll = false;
            spareTime = times[i].timestart - nowTime;
            times[i].timeShown = '距拼团开始还有：' + secondFormat(spareTime);
            times[i].timeActive = 'bc-c';
            times[i].timeType = 1
            secondFormat2(spareTime, times[i])
        } else {
            if (nowTime < times[i].timeend) {
                finishAll = false;
                spareTime = times[i].timeend - nowTime;
                times[i].timeShown = '距拼团结束还有：' + secondFormat(spareTime);
                times[i].timeActive = 'bc-danger';
                times[i].timeType = 2
                secondFormat2(spareTime, times[i])
            } else {
                times[i].timeShown = '拼团已经结束';
                times[i].timeActive = 'bc-c';
                times[i].timeType = 3
                secondFormat2(spareTime, times[i])
            }
        }
    }
    return finishAll;
}


module.exports = {
    cutdownTime: cutdownTime,
    secondFormat: secondFormat,
    cutdownTime2: cutdownTime2,
    cutdownTime3: cutdownTime3,
    cutdownTime4: cutdownTime4,
    cutdownTime5: cutdownTime5
}
