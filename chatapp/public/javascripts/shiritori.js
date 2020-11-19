'use strict';

let userList = [];
let wordList = [];
let userNum;
let turn = 0;
let initial = 'り';

// ユーザ名を取得する
const userName = $('#userName').val();
// 入室メッセージイベントを送信する
socket.emit('sendEnterShiritoriUserName', userName);

//開始ボタンを押したときの処理
function shiritoriStart(){
    //初期化
    $('#thread').html('');
    $('#result').html('');
    wordList = [];
    turn = 0;
    initial = 'り';
    //しりとりのテキストエリアなどを非表示から表示状態に変更
    $('#shiritori-contents').css('display', 'block');
    //開始、終了ボタンは非表示状態に変更
    $('#start-button').css('display', 'none');
    $('#end-button').css('display', 'none');
    //他のプレイヤーも開始状態にする
    socket.emit('sendStartFlag');
    //誰の順番かを表示させる
    $('#turn').html('<p>' + userList[turn] + 'の順番です</p>');
    //しりとりの「り」から開始
    $('#initial').html('<p>「' + initial + '」から始まる言葉を入力してください</p>');

    return false;
}

//しりとりの投稿ボタンを押したときの処理
function shiritoriPublish(){
    // ユーザ名を取得
    const userName = $('#userName').val();
    //自分の順番であるかチェック
    if(userName !== userList[turn]){
        alert('あなたの順番ではありません。');
        return false;
    }
    // 入力された言葉を取得
    const word = $('#word').val();

    //頭文字が正しいかチェック
    //チェックの前にカタカナはひらがなに変換
    let charCode = word[0].codePointAt(0);
    if(12450 <= charCode && charCode <= 12531){
        charCode -= 96;
    }else if(12353 > charCode || charCode > 12435){
        //ひらがなでもなければアラート
        alert('ひらがなまたはカタカナを入力してください。');
        return false;
    }
    let firstChar = String.fromCodePoint(charCode);

    if(firstChar !== initial){
        alert(`${initial}から始まる言葉を入力してください。`);
        return false;
    }
    //空欄でないかチェック
    if(word === ''){
        alert('空欄です');
        return false;
    }
    //既に使われた言葉でないかチェック
    if(wordList.includes(word)){
        alert(`${word}は既に使われています`);
        return false;
    }
    //テキストを空にする
    $('#word').val('')
    // 投稿内容を送信
    const data = userName + 'さん:' + word ;
    socket.emit('sendWord', data);
    return false;
}

// しりとり終了ボタンを押したときの処理
function shiritoriEnd() {
    // ユーザ名取得
    const userName = $('#userName').val();
    // 参加ユーザのリストから消去
    socket.emit('sendExitShiritoriUserName', userName);
    // 退室
    location.href = '/';
}

//最後の文字が小文字だったときの処理（実装泥沼でごめんなさい）
function lastCharTranslation(word){
    let lastChar = word[word.length - 1];

    //カタカナの場合ひらがなに変換
    let charCode = lastChar.codePointAt(0);
    if(12450 <= charCode && charCode <= 12531){
        charCode -= 96;
    }
    lastChar = String.fromCodePoint(charCode);

    if(lastChar == 'ぁ'){
        lastChar = 'あ';
    }else if(lastChar == 'ぃ'){
        lastChar = 'い';
    }else if(lastChar == 'ぅ'){
        lastChar = 'う';
    }else if(lastChar == 'ぇ'){
        lastChar = 'え';
    }else if(lastChar == 'ぉ'){
        lastChar = 'お';
    }else if(lastChar == 'っ'){
        lastChar = 'つ';
    }else if(lastChar == 'ゃ'){
        lastChar = 'や';
    }else if(lastChar == 'ゅ'){
        lastChar = 'ゆ';
    }else if(lastChar == 'ょ'){
        lastChar = 'よ';
    }

    return lastChar;
}


// サーバから受信したユーザリストを画面上に表示する
socket.on('receiveUserList', function (data) {
    userList = data;
    userNum = data.length;
    $('#userList').html('<p>' + '参加ユーザ: ' + data + '</p>');
    if(userNum >= 2){
        $('#start-button').css('display', 'block');
    }else{
        $('#start-button').css('display', 'none');
    }
    console.log(userNum);
});

// しりとりを開始させる
socket.on('receiveStartFlag', function () {
    //初期化
    $('#thread').html('');
    $('#result').html('');
    wordList = [];
    turn = 0;
    initial = 'り';
    //しりとりのテキストエリアなどを非表示から表示状態に変更
    $('#shiritori-contents').css('display', 'block');
    //開始、終了ボタンは非表示状態に変更
    $('#start-button').css('display', 'none');
    $('#end-button').css('display', 'none');
    //誰の順番かを表示させる
    $('#turn').html('<p>' + userList[turn] + 'の順番です ' + '</p>');
    //しりとりの「り」から開始
    $('#initial').html('<p>「' + initial + '」から始まる言葉を入力してください</p>');
});

// 敗者が決定してしりとり終了
socket.on('receiveEndFlag', function (data) {
    //開始、終了ボタンは表示状態に変更
    $('#start-button').css('display', 'block');
    $('#end-button').css('display', 'block');
    //結果を表示
    $('#result').html(`<p>${data}の負け</p>`);
    $('#shiritori-contents').css('display', 'none');
    //initialとturnの表示を消す
    $('#initial').html('');
    $('#turn').html('');
});

// サーバから受信した投稿メッセージを画面上に表示する
socket.on('receiveWord', function (data) {
    //頭文字を更新
    lastCharTranslation(data)
    initial = lastCharTranslation(data);
    $('#initial').html('<p>「' + initial + '」から始まる言葉を入力してください</p>');
    //順番を更新
    turn += 1;
    if(turn >= userNum){
        turn = 0;
    }
    $('#turn').html('<p>' + userList[turn] + 'の順番です ' + '</p>');
    //投稿内容を表示
    $('#thread').prepend('<p>' + data + '</p>');
});

// サーバからwordListを受信
socket.on('receiveWordList', function (data) {
    wordList = data;
});