/**
 * 質問マスターデータ（本番仕様）
 *
 * targetAttribute:
 *   'all'           → 全員共通
 *   'hasPet'        → ペットがいる家庭
 *   'hasChild'      → 子供がいる家庭
 *   'hasElder'      → 高齢者がいる家庭
 *   'hasDisability' → 障害のある方がいる家庭
 *   'otherText'     → その他（自由入力）がある家庭
 *
 * テンプレート変数:
 *   {prevAnswer:qX}  → 質問 qX の回答で置換
 *   {location}       → ユーザーの「よくいる場所」で置換
 *   {otherText}      → ユーザーの「その他」属性テキストで置換
 */
export const QUESTIONS = [
    // ===== 全員共通（9問）=====
    {
        id: 'q1',
        text: 'もしも、\n自宅にいる時\n災害が発生して、\n避難所に逃げるなら\nどこ？',
        targetAttribute: 'all',
        placeholder: '南小学校',
        memo: '例）津波が来たら、避難所に向かわず近くのマンションへ逃げ込む',
    },
    {
        id: 'q2',
        text: 'もしも、\n{prevAnswer:q1}が\n浸水や満員で\n使えなかったら\nどこへ行く？',
        targetAttribute: 'all',
        placeholder: '東中学校',
        memo: '例）第二候補の避難所を事前に確認しておく',
    },
    {
        id: 'q3',
        text: 'もしも、\n{location}にいる時\n災害が発生して、\n避難所に逃げるなら\nどこ？',
        targetAttribute: 'all',
        placeholder: '職場近くの○○公民館',
        memo: '例）自宅以外の場所でも最寄りの避難所を確認しておく',
    },
    {
        id: 'q4',
        text: 'もしも、\n{location}から向かった\n{prevAnswer:q3}が\n使えなかったら\nどこへ行く？',
        targetAttribute: 'all',
        placeholder: '△△小学校',
        memo: '例）外出先でも第二候補を決めておくと安心',
    },
    {
        id: 'q5',
        text: 'もしも、\nスマホが繋がらず\nいつもの連絡が\nできない時の\n連絡手段は？',
        targetAttribute: 'all',
        placeholder: '災害用伝言ダイヤル 171',
        memo: '例）災害用伝言ダイヤル171の使い方を家族で練習しておく',
    },
    {
        id: 'q6',
        text: 'もしも、\n{prevAnswer:q5}すらも\n使用できなかった\n場合の連絡手段は？',
        targetAttribute: 'all',
        placeholder: '近所の○○さんに伝言を頼む',
        memo: '例）複数の連絡手段を決めておくと安心',
    },
    {
        id: 'q7',
        text: 'もしも、\n家を離れる時に\n家族への「置き手紙」を\n残すなら\nどこに貼る？',
        targetAttribute: 'all',
        placeholder: '冷蔵庫のドア',
        memo: '例）家族全員が必ず見る場所を決めておく',
    },
    {
        id: 'q8',
        text: 'もしも、\n今すぐ避難が必要な時\n「非常持ち出し袋」を\nどこから探す？',
        targetAttribute: 'all',
        placeholder: '玄関横のクローゼット',
        memo: '例）家族全員が場所を知っていることが大切',
    },
    {
        id: 'q9',
        text: 'もしも、\n避難の時に\nこれだけは\n絶対に持っていく\nものは？',
        targetAttribute: 'all',
        placeholder: 'スマホ・充電器・保険証コピー',
        memo: '例）貴重品、水、薬など最低限をリストアップしておく',
    },

    // ===== 属性別質問 =====
    {
        id: 'q_pet',
        text: 'もしも、\n避難が必要になった時\nペットを\n誰が連れて逃げる？',
        targetAttribute: 'hasPet',
        placeholder: 'パパがケージを持って避難する',
        memo: '例）ペット同行可能な避難所を事前に調べておく。ケージやリードも準備',
    },
    {
        id: 'q_child',
        text: 'もしも、\n避難が必要になった時\n子供を\n誰が連れて逃げる？',
        targetAttribute: 'hasChild',
        placeholder: 'ママが子供を連れて避難する',
        memo: '例）学校にいる時は学校の指示に従い、引き渡しを待つ',
    },
    {
        id: 'q_elder',
        text: 'もしも、\n避難が必要になった時\n高齢者を\n誰が連れて逃げる？',
        targetAttribute: 'hasElder',
        placeholder: 'パパがおばあちゃんを連れて避難する',
        memo: '例）要支援者名簿への登録や、近所への協力依頼も検討する',
    },
    {
        id: 'q_disability',
        text: 'もしも、\n避難が必要になった時\n障害者を\n誰が連れて逃げる？',
        targetAttribute: 'hasDisability',
        placeholder: '家族全員で協力して避難する',
        memo: '例）福祉避難所の場所と連絡先を事前に確認しておく',
    },
    {
        id: 'q_other',
        text: 'もしも、\n避難が必要になった時\n{otherText}を\n誰が連れて逃げる？',
        targetAttribute: 'otherText',
        placeholder: '家族で役割を決めておく',
        memo: '例）事前に役割分担を話し合っておく',
    },
];
