type Params = {
  key: string;
};

type Result = {
  status: number;
};

declare const Parser: any; // GASのライブラリは型定義がないので、declareで型定義を行う

//eslint-disable-next-line @typescript-eslint/no-unused-vars
function doPost(e: any): GoogleAppsScript.Content.TextOutput{
  const params: Params = JSON.parse(e.postData.getDataAsString())
  const key: string = params.key
  // key == 'RankingForKindle' 以外なら処理を実行しない
  if (key != 'RankingForKindle'){
    const inValidResult: Result = { 'status': 403 }
    return ContentService.createTextOutput(JSON.stringify(inValidResult)).setMimeType(ContentService.MimeType.JSON)
  }

  const activeSpreadSheet = SpreadsheetApp.openById('YOUR_SPREAD_SHEET_ID')
  const sheet: GoogleAppsScript.Spreadsheet.Sheet | null = activeSpreadSheet.getSheetByName('YOUR_SHEET_NAME'); 
  if(sheet == null){
    const failureResult: Result = { 'status': 500 }
    return ContentService.createTextOutput(JSON.stringify(failureResult)).setMimeType(ContentService.MimeType.JSON)
  }
  const values = sheet.getDataRange().getValues(); //受け取ったシートのデータを二次元配列に取得

  try
  {
    for (let i=1; i < values.length; i++) {
      let url = values[i][0]
      let title = values[i][1]
      let targetSheetName = values[i][2]
      console.log(url)
      console.log(title)
      console.log(targetSheetName)
      writeRankingInfo(url, title, targetSheetName)

      // アクセスが集中するのを避けるため、一定期間(60秒)待機する
      Utilities.sleep(60000)
    }
    // 成功のレスポンス
    const successResult: Result = { 'status': 200 }
    return ContentService.createTextOutput(JSON.stringify(successResult)).setMimeType(ContentService.MimeType.JSON)
  }
  catch
  {
    // 失敗のレスポンス
    const failureResult: Result = { 'status': 500 }
    return ContentService.createTextOutput(JSON.stringify(failureResult)).setMimeType(ContentService.MimeType.JSON)
  }
}

function getCurrentRank(url: string){
  const response = UrlFetchApp.fetch(url)
  // const logFilePath = outputLog(response.getContentText())
  // console.log(logFilePath)
  const fromText = '<ul class="a-unordered-list a-nostyle a-vertical zg_hrsr">'
  const toText = '</ul>'

  const titleList = Parser.data(response.getContentText())
                          .from(fromText)
                          .to(toText)
                          .iterate()

  let rank = 'Not found.'
  for(let i=0; i<titleList.length; i++){
    // titleList[i].match(/ - .+?位/)[0] でハイフン付きの順位が取得できる
    console.log(titleList[i])
    const regExpResult = titleList[i].match(/ - .+?位/)
    console.log(`regExpResult:${regExpResult}`)
    rank = regExpResult[0].replace(' - ', '')
  }
  console.log(rank)
  return rank
}

function writeRankingInfo(url: string, title: string, targetSheetName: string) {
  const formattedCurrentTime = timeFormat(new Date())  
  const activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet(); // 現在のSpreadSheetを取得
  const sheet = activeSpreadSheet.getSheetByName(targetSheetName); // シート(SpreadSheetの下のタブ名を指定)
  if(sheet == null){ 
    return 
  }
  const rank = getCurrentRank(url)
  // values[1][1]にタイトルを書き込む
  sheet.getRange(1, 1).setValue(title)
  sheet.appendRow(['', formattedCurrentTime, rank])
}

function timeFormat(time: Date): string {
  // const time = new Date()
  // 年月日を取得
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const date = time.getDate()
  // 時分秒を取得
  const hour = time.getHours()
  const minute = time.getMinutes()
  const second = time.getSeconds()

  const formatted: string = year + "/" + month + "/" + date + " " + hour + ":" + minute + ":" + second
  console.log(formatted)
  return formatted
}

/**
 * ログをGoogleDriveのファイルとして書き出し
 */
function outputLog(text: string): string {
  // 保存ファイル設定
  const now = new Date()
  const fileName    = 'log_' + formatDate(now, 'YYYYMMDDhhmmss') + '.txt'
  const contentType = 'text/plain'
  const charset     = 'utf-8'

  // ファイルを作成する
  const blob = Utilities.newBlob('', contentType, fileName).setDataFromString(text, charset)
  const file = DriveApp.createFile(blob)
  return file.getUrl()
}

/**
 * 時刻を指定したフォーマットに沿った文字列に変換
*/
function formatDate(date: Date, format: string | null): string {
  let dateText: string = (format == null) ? 'YYYY-MM-DD' : format;
  dateText = dateText.replace(/YYYY/g, date.getFullYear().toString());
  dateText = dateText.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  dateText = dateText.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  dateText = dateText.replace(/hh/g, ('0' + date.getHours()).slice(-2));
  dateText = dateText.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  dateText = dateText.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  dateText = dateText.replace(/M/g,  (date.getMonth() + 1).toString());
  dateText = dateText.replace(/D/g,  date.getDate().toString());
  dateText = dateText.replace(/h/g,  date.getHours().toString());
  dateText = dateText.replace(/m/g,  date.getMinutes().toString());
  dateText = dateText.replace(/s/g,  date.getSeconds().toString());
  return dateText;
}
