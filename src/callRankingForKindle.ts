function myFunction() {
    const url = 'YOUR_APP_SCRIPT_URL'
  
    const data = {
      'key': 'RankingForKindle'
    }
    const options: object = {
      "Content-Type": "application/json",
      "method": "post",
      "payload": JSON.stringify(data)
    }
    const response = UrlFetchApp.fetch(url, options)
    const status = response.getContentText()
    console.log('status:')
    console.log(status) // 200以外なら異常あり
  }
  