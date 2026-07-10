/* Gorkhali in Japan — bilingual copy. English default; 日本語 via toggle. */

const COPY = {
  en: {
    brand: "Gorkhali in Japan",
    navAbout: "About", navStory: "Story", navCode: "Skills", navVideos: "Videos", navConnect: "Connect",
    subscribe: "Subscribe",

    heroEyebrow: `A channel by <strong>Manoj Poudel</strong> — software engineer in Tokyo`,
    heroTag: `From the hills of <em>Nepal</em> to the heart of <em>Tokyo</em> —<br>the honest blueprint for an IT career in Japan.`,
    heroCta1: "Watch the journey ↓",
    heroLoc: "Currently in Tokyo, Japan",
    heroMeta: ["Since 2023", "Sapporo → Tokyo", "EN · नेपाली · 日本語 · हिन्दी"],

    marquee: "IT CAREER IN JAPAN ✦ SENMON GAKKO ✦ JOB HUNTING ✦ HOKKAIDO VLOGS ✦ NAITEI ✦ TOKYO LIFE ✦ NEPALI IN JAPAN ✦ CODE ✦ ",

    aboutKicker: "About",
    aboutTitle: "The person behind the channel",
    aboutP1: `Manoj Poudel was born in Nepal in 1999. In 2022 he traded the hills of home for the snow of Sapporo — arriving as a student with beginner Japanese and a one-way plan. Four years of language drills, convenience-store night shifts and IT college later, he works as a software engineer in Tokyo.`,
    aboutP2: `The camera came along for all of it. What began as a student vlog is now a blueprint channel — public proof that the road from Kathmandu to a Tokyo engineering job is real and walkable. When he's not filming or coding, he's probably near the water, planning the next video.`,
    aboutLangsLabel: "Speaks",
    aboutLangs: ["English", "नेपाली Nepali", "日本語 Japanese", "हिन्दी Hindi"],
    aboutFacts: [
      { icon: "💼", text: "Software Engineer" },
      { icon: "🎥", text: "Creator since 2023" },
      { icon: "🎓", text: "IT College, Sapporo" }
    ],
    photoAlt: "Manoj Poudel — portrait by the harbor",

    storyKicker: "The Story",
    storyTitle: `No fake dreams.<br>Just the actual roadmap.`,
    storyIntro: `In 2022, Manoj Poudel boarded a one-way flight from Kathmandu to Hokkaido with a student visa, beginner Japanese, and a plan. What followed was the least glamorous version of the dream: language-school drills, convenience-store night shifts through minus-ten Sapporo winters, IT college assignments due at 9 a.m., and the quiet responsibility of a family back home. In January 2023 he started filming it — not a highlight reel, but the actual numbers: what college really costs, what part-time work really pays, what job hunting in Japan really takes. Four years after landing, he signed his first contract as a software engineer in Tokyo. This channel is the map he wishes he'd had.`,

    timeline: [
      { year: "2022", title: "One-way to the snow", text: "Twenty-three years old, Kathmandu to Sapporo. A new alphabet on every sign, the deepest winter he'd ever seen, and a promise to himself: make it work." },
      { year: "2023", title: "The camera turns on", text: "Gorkhali in Japan uploads its first vlog in January. Temples, Tokyo Skytree, a first golf swing — a student learning to tell his story in three languages." },
      { year: "2024", title: "The honest-numbers era", text: "The channel finds its voice. “IT Courses in Japan” breaks down the real fees and curriculum of Japanese IT college and becomes the most-watched video. The part-time job reality follows — filmed between actual shifts." },
      { year: "2025", title: "Code after midnight", text: "Between classes and shifts, real software ships: a face-recognition system in Python, full-stack React apps, AI-powered finance tools. The portfolio grows in public, commit by commit." },
      { year: "2026", title: "内定 — the offer", text: "Job hunting in Japan, documented honestly: the applications, the strategy, the persistence — and finally the word every job hunter waits to hear: naitei." },
      { year: "Now", title: "Software engineer, Tokyo", text: "From stocking shelves in Sapporo to shipping software in Tokyo — exactly four years. Now the channel becomes what it was always meant to be: the blueprint for the next person." }
    ],

    pillarsKicker: "On the channel",
    pillarsTitle: "Four honest lanes",
    pillars: [
      { num: "01", title: "The IT Blueprint", text: "Deep dives into Japanese IT college (senmon gakko) — real curriculum, real costs, real skills, and whether it's worth it." },
      { num: "02", title: "The Career Guide", text: "Step-by-step job-hunting strategy: interviews, portfolios, and how a foreigner actually gets an offer in Japan's tech industry." },
      { num: "03", title: "Real Projects", text: "The coding journey in public — from face recognition to full-stack apps to AI tools, shipped and explained." },
      { num: "04", title: "Life in Japan", text: "Hokkaido vlogs, part-time job reality, grocery prices, onsen trips, and the move to Tokyo — unfiltered." }
    ],

    skillsKicker: "Behind the scenes",
    skillsTitle: `A creator who builds`,
    skillsSub: "The channel is the craft — and a few tools power everything from thumbnails to 3D intros to the apps on the side.",
    skillGroups: [
      { label: "Creating", items: [
        { icon: "🎬", name: "Video editing" },
        { icon: "🎨", name: "Thumbnail design" },
        { icon: "🧊", name: "Blender 3D" },
        { icon: "🎮", name: "Unreal Engine" },
        { icon: "🗣️", name: "Storytelling" }
      ]},
      { label: "Building", items: [
        { icon: "⚛️", name: "React" },
        { icon: "🐍", name: "Python" },
        { icon: "🟨", name: "JavaScript" },
        { icon: "🐘", name: "PHP" },
        { icon: "🐙", name: "Git & GitHub" }
      ]}
    ],
    reposLabel: "A little code on the side —",
    repos: [
      { name: "AI Budget Tracker", repo: "budget-tracker" },
      { name: "Weather Planner", repo: "weather-travel-planner" },
      { name: "StudyTrack Pro", repo: "studytrack-pro" }
    ],
    projCta: "See the code on GitHub ↗",

    mvKicker: "The big one",
    mvTitle: "Most viewed",
    mvBadge: "★ Most viewed",
    mvVideoTitle: "My First Vlog in Japan — Hokkaido",
    mvDesc: "Where it all began: the very first upload — a Nepalese student's first days in Hokkaido, camera shaking, dream intact. The video that still brings the most people to the channel.",
    mvViews: "views", mvLikes: "likes", mvYear: "published",
    mvLive: "LIVE",
    mvWatch: "Watch on YouTube ↗",

    vidKicker: "Selected videos",
    vidTitle: "Watch the journey",
    vidBadgeNew: "Newest", vidBadgeTop: "Most watched", vidViews: "views",
    vidCta: "All videos on YouTube ↗",

    numbers: [
      { id: "subs", n: 493, label: "subscribers", live: true },
      { id: "views", n: 17490, label: "total views", live: true },
      { id: "vids", n: 19, label: "videos", live: true },
      { id: "langs", n: 4, label: "languages spoken" }
    ],

    audKicker: "Made for",
    audTitle: "Who this is for",
    audience: [
      { icon: "🎓", title: "The Planner", text: "You're in Nepal — or anywhere — planning to study in Japan, and you want the real numbers before you commit your family's savings." },
      { icon: "💻", title: "The Job Hunter", text: "You're already here, staring down job-hunting season, and you need a strategy from someone who got the offer the hard way." },
      { icon: "🗾", title: "The Curious", text: "You just love honest life-in-Japan stories — snow, shrines, convenience stores, and the occasional hot spring." }
    ],

    conKicker: "Let's build together",
    conTitle: `Say <em>namaste</em>.`,
    footBuilt: "Designed & built by Manoj Poudel"
  },

  ja: {
    brand: "ゴルカリ・イン・ジャパン",
    navAbout: "プロフィール", navStory: "ストーリー", navCode: "スキル", navVideos: "動画", navConnect: "つながる",
    subscribe: "登録する",

    heroEyebrow: `<strong>マノジュ・ポーデル</strong>のチャンネル — 東京のソフトウェアエンジニア`,
    heroTag: `<em>ネパール</em>の丘から、<em>東京</em>の中心へ —<br>日本でITキャリアを築くための、正直な設計図。`,
    heroCta1: "旅を見る ↓",
    heroLoc: "現在：東京在住",
    heroMeta: ["2023年から", "札幌 → 東京", "EN · नेपाली · 日本語 · हिन्दी"],

    marquee: "日本のITキャリア ✦ 専門学校 ✦ 就活 ✦ 北海道Vlog ✦ 内定 ✦ 東京ライフ ✦ 在日ネパール人 ✦ コード ✦ ",

    aboutKicker: "プロフィール",
    aboutTitle: "チャンネルの中の人",
    aboutP1: `マノジュ・ポーデル、1999年ネパール生まれ。2022年、故郷の丘を離れて札幌の雪の中へ — 初級の日本語と片道の計画だけを持った留学生だった。語学学校の特訓、コンビニの夜勤、専門学校での4年間を経て、いまは東京でソフトウェアエンジニアとして働いている。`,
    aboutP2: `その全ての瞬間に、カメラがあった。学生Vlogとして始まったチャンネルは、いまや「設計図」になった — カトマンズから東京のエンジニア職への道が、本当に歩ける道だという公開の証明。撮影もコーディングもしていない時は、たぶん海の近くで次の動画を考えている。`,
    aboutLangsLabel: "話せる言語",
    aboutLangs: ["English 英語", "नेपाली ネパール語", "日本語", "हिन्दी ヒンディー語"],
    aboutFacts: [
      { icon: "💼", text: "ソフトウェアエンジニア" },
      { icon: "🎥", text: "2023年からクリエイター" },
      { icon: "🎓", text: "札幌のIT専門学校卒" }
    ],
    photoAlt: "マノジュ・ポーデル — 港にて",

    storyKicker: "ストーリー",
    storyTitle: `夢物語ではなく、<br>本当のロードマップを。`,
    storyIntro: `2022年、マノジュ・ポーデルは学生ビザと初級の日本語、そしてひとつの計画を持って、カトマンズから北海道への片道便に乗った。そこから始まったのは、夢の一番地味なバージョンだった。語学学校の反復練習、氷点下10度の札幌でのコンビニ夜勤、朝9時締切の専門学校の課題、そして故郷の家族への静かな責任。2023年1月、彼はその全てを撮り始めた — ハイライト集ではなく、本当の数字を。学費はいくらか、バイトの給料は実際いくらか、日本の就活には何が必要か。来日からちょうど4年後、彼は東京でソフトウェアエンジニアとして最初の契約を結んだ。このチャンネルは、彼自身が欲しかった地図だ。`,

    timeline: [
      { year: "2022", title: "雪国への片道切符", text: "23歳、カトマンズから札幌へ。どの看板も読めない新しい文字、人生で一番深い冬。それでも「やり遂げる」と自分に誓った。" },
      { year: "2023", title: "カメラが回り始める", text: "1月、Gorkhali in Japanが最初のVlogを投稿。寺院、東京スカイツリー、初めてのゴルフ — 3つの言語で自分の物語を語り始めた留学生。" },
      { year: "2024", title: "「本当の数字」の時代", text: "チャンネルが自分の声を見つける。「IT Courses in Japan」が専門学校の本当の学費とカリキュラムを解説し、最も再生された動画に。コンビニバイトのリアルも、実際のシフトの合間に撮影された。" },
      { year: "2025", title: "真夜中のコード", text: "授業とバイトの合間に、本物のソフトウェアを作り続けた。Pythonの顔認識システム、フルスタックのReactアプリ、AI家計簿。ポートフォリオはGitHubで、コミットひとつずつ育っていった。" },
      { year: "2026", title: "内定 — 就活の結実", text: "日本の就活を正直に記録した。エントリー、戦略、粘り強さ — そしてついに、就活生が待ち望むあの言葉：内定。" },
      { year: "現在", title: "東京のソフトウェアエンジニア", text: "札幌で棚に品出しをしていた青年が、東京でソフトウェアを作るまで、ちょうど4年。これからこのチャンネルは、次の誰かのための設計図になる。" }
    ],

    pillarsKicker: "チャンネルの内容",
    pillarsTitle: "4つの正直なテーマ",
    pillars: [
      { num: "01", title: "IT設計図", text: "日本の専門学校を徹底解剖 — 本当のカリキュラム、本当の費用、本当に身につくスキル。そして、その価値はあるのか。" },
      { num: "02", title: "キャリアガイド", text: "就活のステップバイステップ戦略。面接、ポートフォリオ、外国人が日本のIT業界で内定を取る方法。" },
      { num: "03", title: "リアルなプロジェクト", text: "公開で進むコーディングの旅 — 顔認識からフルスタックアプリ、AIツールまで。作って、説明する。" },
      { num: "04", title: "日本での生活", text: "北海道Vlog、バイトのリアル、野菜の値段、温泉旅行、そして東京への引越し — ありのまま。" }
    ],

    skillsKicker: "舞台の裏側",
    skillsTitle: `作る人、つくる人`,
    skillsSub: "チャンネルそのものが作品 — サムネイルから3Dのイントロ、そして趣味のアプリまで、いくつかの道具が支えている。",
    skillGroups: [
      { label: "クリエイティブ", items: [
        { icon: "🎬", name: "動画編集" },
        { icon: "🎨", name: "サムネイル制作" },
        { icon: "🧊", name: "Blender 3D" },
        { icon: "🎮", name: "Unreal Engine" },
        { icon: "🗣️", name: "ストーリーテリング" }
      ]},
      { label: "開発", items: [
        { icon: "⚛️", name: "React" },
        { icon: "🐍", name: "Python" },
        { icon: "🟨", name: "JavaScript" },
        { icon: "🐘", name: "PHP" },
        { icon: "🐙", name: "Git & GitHub" }
      ]}
    ],
    reposLabel: "趣味で書いたコードも少し —",
    repos: [
      { name: "AI家計簿", repo: "budget-tracker" },
      { name: "天気プランナー", repo: "weather-travel-planner" },
      { name: "StudyTrack Pro", repo: "studytrack-pro" }
    ],
    projCta: "GitHubでコードを見る ↗",

    mvKicker: "代表作",
    mvTitle: "最も再生された動画",
    mvBadge: "★ 最も再生",
    mvVideoTitle: "日本での初めてのVlog — 北海道",
    mvDesc: "すべてはここから始まった — ネパール人留学生の北海道での最初の日々。カメラは揺れていても、夢は揺るがなかった。今もチャンネルに一番多くの人を連れてくる動画。",
    mvViews: "再生回数", mvLikes: "高評価", mvYear: "公開年",
    mvLive: "ライブ",
    mvWatch: "YouTubeで見る ↗",

    vidKicker: "選りすぐりの動画",
    vidTitle: "旅を見る",
    vidBadgeNew: "最新", vidBadgeTop: "最も再生", vidViews: "回視聴",
    vidCta: "YouTubeで全動画を見る ↗",

    numbers: [
      { id: "subs", n: 493, label: "チャンネル登録者", live: true },
      { id: "views", n: 17490, label: "総再生回数", live: true },
      { id: "vids", n: 19, label: "動画本数", live: true },
      { id: "langs", n: 4, label: "話せる言語" }
    ],

    audKicker: "こんな人のために",
    audTitle: "誰のためのチャンネル？",
    audience: [
      { icon: "🎓", title: "計画中の人", text: "ネパールで — あるいは世界のどこかで — 日本留学を計画していて、家族の貯金を懸ける前に本当の数字を知りたい人。" },
      { icon: "💻", title: "就活中の人", text: "すでに日本にいて、就活シーズンを前に、苦労して内定を勝ち取った先輩の戦略が必要な人。" },
      { icon: "🗾", title: "日本が好きな人", text: "雪、神社、コンビニ、たまの温泉 — 正直な日本の日常の物語がただ好きな人。" }
    ],

    conKicker: "一緒に作ろう",
    conTitle: `<em>ナマステ</em>、と言おう。`,
    footBuilt: "デザイン・制作：マノジュ・ポーデル"
  }
};

/* Featured videos — real channel data. Titles in both languages. */
const VIDEOS = [
  { id: "tA5QegxdCBw", en: "Reality of Working in a Japanese IT Company", ja: "日本のIT企業で働くリアル", year: 2026, views: null, badge: "new" },
  { id: "hPVdMRuahJc", en: "Japanese IT Job Hunting Reality — The Road to 内定", ja: "日本のIT就活リアル — 内定への道", year: 2026, views: null, badge: null },
  { id: "SVeaV58La0c", en: "My 2 Years IT College Journey in Japan (Reality, Cost, Skills, Jobs)", ja: "IT専門学校2年間の旅（リアル・費用・スキル・就職）", year: 2026, views: null, badge: null },
  { id: "Vmf3hdqbSOs", en: "IT Courses in Japan: Everything You Need to Know", ja: "日本のITコース：知っておくべき全て", year: 2024, views: "1.8K", badge: null },
  { id: "Ixd2jGoHsG4", en: "Part-Time Jobs in Japan — What I Actually Did", ja: "日本でのアルバイト — 実際にやった仕事", year: 2024, views: "1.7K", badge: null },
  { id: "KGJ8B0Dc7_0", en: "Noboribetsu Hell Valley — 登別地獄谷 (in Japanese)", ja: "登別地獄谷 — 友達と行く温泉旅（日本語）", year: 2026, views: null, badge: null },
  { id: "Tjk-iSCWmoI", en: "Temple Vlog — Meeting My Friend After 1 Year in Japan", ja: "寺院Vlog — 1年ぶりの再会", year: 2023, views: null, badge: null },
  { id: "HyncrIIeDRo", en: "Otaru Travel Vlog — Hokkaido", ja: "小樽旅行Vlog — 北海道", year: 2024, views: null, badge: null }
];

/* Most-viewed video + live-stat fallbacks (verified live 2026-07-08) */
const MOST_VIEWED = { id: "sFcuoPCLylQ", year: 2023, fallbackViews: 7783, fallbackLikes: 371 };
const CHANNEL_ID = "UCBKB2A3BcpOb8YQAHgBEHcw";

/* Tools & tech for the infinite logo marquee (real self-hosted SVG logos in /logos) */
const LOGOS = [
  { file: "blender", name: "Blender" },
  { file: "unrealengine", name: "Unreal Engine" },
  { file: "react", name: "React" },
  { file: "javascript", name: "JavaScript" },
  { file: "python", name: "Python" },
  { file: "php", name: "PHP" },
  { file: "nodejs", name: "Node.js" },
  { file: "mysql", name: "MySQL" },
  { file: "mongodb", name: "MongoDB" },
  { file: "opencv", name: "OpenCV" },
  { file: "html5", name: "HTML5" },
  { file: "css3", name: "CSS3" },
  { file: "git", name: "Git" },
  { file: "github", name: "GitHub" }
];
