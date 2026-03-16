import BackButton from '../components/ui/BackButton';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center relative" style={{ zIndex: 1 }}>
      <div className="w-full py-10 px-5 relative bg-white">
        <div className="w-full max-w-[402px] mx-auto flex flex-col gap-5">
          <BackButton />

          <div className="bg-[#F4F7FB] rounded-2xl px-5 py-5 space-y-4">
            <h1 className="text-primary font-black text-[22px] leading-snug">
              プライバシーポリシー
            </h1>
            <div className="space-y-3 text-[14px] leading-relaxed text-text">
              <p>最終更新日：2026年3月16日</p>

              <h2 className="font-semibold mt-4">1. はじめに</h2>
              <p>
                本サービスは、家族で災害への備えについて話し合い、認識の違いを整理し、防災ルールとしてまとめることを支援するためのWebサービスです。本ポリシーでは、本サービスにおける入力情報の取扱いについて説明します。
              </p>

              <h2 className="font-semibold mt-4">2. 取得する情報</h2>
              <p>本サービスでは、主に以下の情報を取り扱います。</p>
              <ul className="list-disc list-inside space-y-1">
                <li>名前</li>
                <li>よくいる場所</li>
                <li>家族構成や避難時の行動に関する回答内容</li>
                <li>防災カードの作成に必要な入力内容</li>
              </ul>
              <p>
                本サービスは、家族内での備えの整理を目的としたものであり、住所、電話番号、勤務先、学校名、病名など、個人を詳細に特定できる情報の入力は想定していません。これらの詳しい個人情報は入力しないでください。
              </p>

              <h2 className="font-semibold mt-4">3. 利用目的</h2>
              <p>取得した情報は、以下の目的のために利用します。</p>
              <ul className="list-disc list-inside space-y-1">
                <li>家族間の回答内容を整理し、認識の違いを可視化するため</li>
                <li>防災ルールや防災カードとして内容を表示するため</li>
                <li>本サービスの表示、保存、共有等の基本機能を提供するため</li>
                <li>不具合対応やサービス改善の参考とするため</li>
              </ul>

              <h2 className="font-semibold mt-4">4. 保存について</h2>
              <p>
                入力内容は、本サービスの提供に必要な範囲で一定期間保存されます。保存されたデータは、保存期間の経過後に自動的に削除されます。
              </p>
              <p>
                本サービスでは、個別の削除依頼には原則として対応していません。削除をご希望の場合も、所定の保存期間の経過による自動削除をお待ちいただく形となります。保存期間は
                [保存期間を記載]
                です。
              </p>

              <h2 className="font-semibold mt-4">5. 第三者提供について</h2>
              <p>取得した情報は、法令に基づく場合を除き、本人の同意なく第三者に提供しません。</p>

              <h2 className="font-semibold mt-4">6. ご利用にあたってのお願い</h2>
              <p>
                本サービスは、防災の備えを家族で整理するための支援ツールです。公開リンクや共有機能を利用する場合は、家族など信頼できる相手とのみ共有してください。また、入力内容には必要最小限の情報のみを記載してください。
              </p>

              <h2 className="font-semibold mt-4">7. ポリシーの見直し</h2>
              <p>
                本ポリシーは、サービス内容の変更や運用上の必要に応じて、予告なく見直すことがあります。変更後の内容は、本ページに掲載した時点から適用されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

