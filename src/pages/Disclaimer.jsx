import BackButton from '../components/ui/BackButton';

export default function Disclaimer() {
  return (
      <div className="min-h-screen bg-white flex flex-col items-center relative" style={{ zIndex: 1 }}>
          <div className="w-full py-10 px-5 relative bg-white">
              <div className="w-full max-w-[402px] mx-auto flex flex-col gap-5">
                  <BackButton />

                  <div className="bg-[#F4F7FB] rounded-2xl px-5 py-5 space-y-4">
                      <h1 className="text-primary font-black text-[22px] leading-snug">
                          利用上の注意
                      </h1>
                      <div className="space-y-3 text-[14px] leading-relaxed text-text">
                          <p>最終更新日：2026年3月16日</p>

                          <h2 className="font-semibold mt-4">1. 本サービスの位置づけ</h2>
                          <p>
                              本サービスは、家族で災害への備えを話し合い、内容を整理するための支援ツールです。回答結果や防災カードは、家族内での認識合わせや備えの確認を目的として表示されるものであり、災害時の行動を機械的に決定するものではありません。
                          </p>

                          <h2 className="font-semibold mt-4">2. 安全の保証について</h2>
                          <p>
                              本サービスを通じて家族で合意した内容は、災害への備えを整理するための目安です。本サービスの利用により、災害時の安全、避難の適切性、連絡の確実性その他の結果を保証するものではありません。
                          </p>

                          <h2 className="font-semibold mt-4">3. 避難判断について</h2>
                          <p>
                              実際の避難判断や安全確保行動は、自治体の避難情報、気象庁等の公的機関の発表、現地の状況、周囲の危険度を踏まえて行ってください。本サービス上の内容よりも、公的情報と現地状況を優先してください。
                          </p>

                          <h2 className="font-semibold mt-4">4. 情報の更新と見直し</h2>
                          <p>
                              家族の状況、生活圏、連絡手段、避難先の候補は時間の経過とともに変わる可能性があります。本サービスで作成した内容は一度決めて終わりではなく、定期的に見直すことをおすすめします。
                          </p>

                          <h2 className="font-semibold mt-4">5. 通信・端末利用ができない場合</h2>
                          <p>
                              災害時には、通信障害、停電、端末の故障や電池切れ等により、本サービスを利用できない場合があります。そのため、必要な内容は紙に印刷して保管する、家族で口頭確認しておくなど、本サービス以外の手段でも共有しておくことをおすすめします。
                          </p>

                          <h2 className="font-semibold mt-4">6. 免責</h2>
                          <p>
                              当方は、本サービスの利用または利用不能、本サービス上の内容に基づく判断、通信環境や端末状況その他の事情により生じた損害について、当方に故意または重過失がある場合を除き、責任を負いません。
                          </p>

                          <h2 className="font-semibold mt-4">7. 内容の変更について</h2>
                          <p>
                              本サービスの内容は、予告なく変更、中断、終了されることがあります。あらかじめご了承ください。
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}

