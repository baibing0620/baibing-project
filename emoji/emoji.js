let emojiBank = "😊-😃-😏-😍-😘-😚-😳-😌-😆-😁-😉-😜-😝-😀-😙-😛-😴-😟-😦-😧-😮-😬-😕-😯-😑-😒-😅-😓-😥-😩-😔-😞-😖-😨-😰-😣-😢-😭-😂-😲-😱-😫-😠-😡-😤-😪-😋-😷-😎-😵-👿-😈-😐-😶-😇-👽-👦-👧-👩-👨-👶-👵-👴-👱-👲-👳-👷-👮-👼-👸-😺-😸-😻-😽-😼-🙀-😿-😹-😾-👹-👺-🙈-🙉-🙊-💂-💀";

export function emoji() {
  return emojiBank.replace(/\s+/g, "").split("-");
}

export function emojiSplitByGroup(pageSize) {
  let emojiArr = emoji();
  let pageCount = Math.ceil(emojiArr.length / pageSize);
  let newArr = [];
  for (let i = 0; i < pageCount; i++) {
    newArr.push(emojiArr.slice(i * pageSize, i * pageSize + pageSize));
  }
  return newArr;
}

export function hasEmojiCharacter(substring) {
  let emotionEmojiRegex = /\[.?[^\]]\]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
  return emotionEmojiRegex.test(substring);
}
