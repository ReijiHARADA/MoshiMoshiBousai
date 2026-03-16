import BackButton from '../components/ui/BackButton';

export default function Contact() {
  return (
      <div className="min-h-screen bg-white flex flex-col items-center relative" style={{ zIndex: 1 }}>
          <div className="w-full py-10 px-5 relative bg-white">
              <div className="w-full max-w-[402px] mx-auto flex flex-col gap-5">
                  <BackButton />

                  <div className="bg-[#F4F7FB] rounded-2xl px-5 py-5 space-y-4">
                      <h1 className="text-primary font-black text-[22px] leading-snug">
                          お問い合わせ
                      </h1>
                      <div className="space-y-3 text-[14px] leading-relaxed text-text">
                          <p>本サービスに関するご質問・不具合報告・削除依頼は、以下よりご連絡ください。</p>
                          <p>内容によっては返信までお時間をいただく場合があります。</p>
                          <p>
                              フィードバックフォーム：
                              <a
                                  href="https://forms.gle/SL6Q5LTbMchyGXvd9"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline underline-offset-2"
                              >
                                  Googleフォームを開く
                              </a>
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
}

