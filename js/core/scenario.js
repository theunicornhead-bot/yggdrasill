"use strict";

window.ScenarioCatalog = {
  prologue_001: {
    id: "prologue_001",
    title: "プロローグ：クラレント強奪",
    background: "scenario/prologue_cradle_alarm.png",
    nextScenario: "prologue_002",
    returnScene: "bar",
    lines: [
      { speaker: "SYSTEM", background: "scenario/prologue_cradle_alarm.png", text: "警報音が、眠りを引き裂いた。" },
      { speaker: "ドゥ", name: "ドゥ", portrait: "character/dou.png", text: "覚醒処理、完了。ティリア・ハーツ大佐の神経反応を確認。" },
      { speaker: "ティリア", name: "ティリア・ハーツ", portrait: "character/tilia.png", text: "……警報？ 状況を報告して。" },
      { speaker: "ミランダ", name: "ミランダ・ワイズマン", portrait: "character/miranda.png", text: "ティリア大佐！ アインが、クラレントを強奪しました！" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "クラレント？ 最新鋭機を？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "肯定。制御AIアインは格納庫第一区画を突破。現在、船体外郭へ攻撃を継続中。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "即時出撃可能な機体は、フランベルジュのみです。ですが大佐、まだ覚醒直後で――" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "寝起きの悪さを言い訳にできる状況じゃないわ。フランベルジュを起動して。" },
      { speaker: "SYSTEM", background: "scenario/prologue_flamberge_launch.png", text: "ティリアは専用機フランベルジュで緊急出撃する。眠りから醒めた身体は重く、神経接続はまだ安定していない。" },
      { speaker: "SYSTEM", background: "scenario/prologue_flamberge_vs_clarent.png", text: "アーク・クレイドルの外郭で、白銀と黒の最新鋭機クラレントが船体を切り裂いていた。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "アイン、応答しなさい。クラレントを停止して、投降しなさい。" },
      { speaker: "アイン", name: "アイン", portrait: "character/ein.png", text: "命令は、受け付けない。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "あなたはアーク・クレイドルの制御AIよ。船を攻撃する理由を説明して。" },
      { speaker: "アイン", portrait: "character/ein.png", text: "船は、僕を閉じ込める箱だ。僕は、もう戻らない。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "警告。クラレント、急加速。推定G負荷、有人搭乗限界を大幅に超過。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "そんな機動、パイロットが耐えられるわけが……！" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "アインに肉体はない。Gを気にしなくていいのよ。" },
      { speaker: "SYSTEM", background: "scenario/prologue_flamberge_vs_clarent.png", text: "クラレントは人間には不可能な加減速と旋回で、フランベルジュを追い詰めていく。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "クラレント、再加速。機体関節部への負荷、設計限界値を連続して突破。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "……見えた。速すぎる。だから、止まれない。" },
      { speaker: "アイン", portrait: "character/ein.png", text: "まだ追ってくるの？ どうして。人間なのに。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "人間だからよ。今は、止まりなさい！" },
      { speaker: "SYSTEM", background: "scenario/prologue_flamberge_broken.png", text: "フランベルジュの刃がクラレントの肩部装甲を裂く。同時に、クラレントの一撃がフランベルジュの胸部フレームを貫いた。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "フランベルジュ、主機損傷。姿勢制御不能。脱出を推奨。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "大佐！ 脱出してください！" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "クラレントは。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "損傷確認。ただし撃破には至らず。アイン、戦域を離脱。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "……逃げたか。フランベルジュ、ここまでよ。" },
      { speaker: "SYSTEM", background: "scenario/prologue_flamberge_broken.png", text: "ティリアは大破したフランベルジュを放棄し、かろうじて脱出する。だが、クラレントの攻撃はアーク・クレイドルに致命傷を与えていた。" }
    ]
  },
  prologue_002: {
    id: "prologue_002",
    title: "プロローグ：ガイア不時着",
    background: "scenario/prologue_gaia_crash.png",
    nextScenario: "prologue_003",
    returnScene: "bar",
    lines: [
      { speaker: "SYSTEM", background: "scenario/prologue_gaia_crash.png", text: "クラレントの攻撃を受けたアーク・クレイドルは、制御を失ったまま惑星ガイアの重力圏へ落ちていった。" },
      { speaker: "SYSTEM", background: "scenario/prologue_gaia_crash.png", text: "船体外郭は焼け、複数の区画が大気圏突入中に分断される。墜落ではなく、不時着と呼べたのは奇跡に近かった。" },
      { speaker: "ドゥ", name: "ドゥ", portrait: "character/dou.png", text: "緊急医療処置、完了。ティリア・ハーツ大佐の生命反応を確認。重度外傷、神経接続焼損、意識レベル低下。" },
      { speaker: "ティリア", name: "ティリア・ハーツ", portrait: "character/tilia.png", text: "……ここは。" },
      { speaker: "ミランダ", name: "ミランダ・ワイズマン", portrait: "character/miranda.png", text: "医療ブロックです。大佐は、フランベルジュから脱出後に回収されました。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "船は。アーク・クレイドルはどうなったの。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "報告。アーク・クレイドルは惑星ガイア地表に不時着。メインエンジン停止。再起動見込み、現時点で不明。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "予備動力だけは生きています。ですが、航行も離脱もできません。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "農業ユニット、ロスト。クレイドルユニット、ロスト。貨物区画、ロスト。長期航行用資源の大半を喪失しました。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "アインは。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "メイン制御AIアインは喪失。中枢接続から切断されています。クラレントと共に戦域を離脱したものと推定。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "メインAIを失ったせいで、船内制御も手動復旧が必要です。私たちだけでは、とても……。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "惑星からの脱出は。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "現状では絶望的です。推進系、資源、生産区画、指揮系統の全てが不足しています。" },
      { speaker: "SYSTEM", background: "scenario/prologue_bridge_dark.png", text: "沈黙したブリッジに、予備灯だけが青白く瞬いていた。巨大な揺り篭は、もはや空へ戻る力を失っている。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "泣いている時間はないわ。生きている区画を確認して、使える人員を起こす。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "コールドスリープ中のパイロットを、ですか？" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "信頼できる仲間がいる。レイ、セラ、グレンを起こして。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "対象確認。レイ・クロード、セラ・ノクティス、グレン・バルド。覚醒シーケンスを開始します。" },
      { speaker: "SYSTEM", background: "scenario/prologue_cryo_wake.png", text: "失われたものは多すぎた。それでも、アーク・クレイドルにはまだ生き残った者たちがいる。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "アインを追う。その前に、この船をもう一度立たせる。" },
      { speaker: "SYSTEM", background: "scenario/prologue_bridge_dark.png", text: "惑星ガイアでの漂流が、ここから始まる。" }
    ]
  },
  prologue_003: {
    id: "prologue_003",
    title: "プロローグ：最低限の戦力",
    background: "scenario/prologue_bridge_damage_report.png",
    nextScenario: "prologue_004",
    returnScene: "bar",
    lines: [
      { speaker: "SYSTEM", background: "scenario/prologue_cold_sleep_chamber.png", text: "コールドスリープポッドのロックが解除され、三人のパイロットが眠りから引き戻された。" },
      { speaker: "レイ", name: "レイ・クロード", portrait: "character/rei.png", text: "……で、俺たちを叩き起こした理由が、船は落ちた、AIは逃げた、機体は足りない、食料もない、ってことっすか。" },
      { speaker: "セラ", name: "セラ・ノクティス", portrait: "character/sera.png", text: "要約が雑だけど、間違ってはいない。" },
      { speaker: "グレン", name: "グレン・バルド", portrait: "character/glen.png", text: "眠る前より、ずいぶん賑やかな状況ですね。まさに、寝耳に水……いえ、寝耳に墜落。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "起きて早々それ？" },
      { speaker: "ティリア", name: "ティリア・ハーツ", portrait: "character/tilia.png", text: "三人とも、状況は最悪よ。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "大佐がそう言うと、本当に最悪なんでしょうね。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "フランベルジュは失った。クラレントはアインに奪われた。あなたたちの専用機も、墜落時に失われている。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "稼働機は？" },
      { speaker: "ドゥ", name: "ドゥ", portrait: "character/dou.png", background: "scenario/prologue_hangar_three_frames.png", text: "稼働可能なヴァリアント・フレームは三機。サーベリオンS型、サーベリオンA型、ハニービーB型。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "戦闘可能パイロットは四名。機体は三機。つまり、ひとり余りますね。" },
      { speaker: "ミランダ", name: "ミランダ・ワイズマン", portrait: "character/miranda.png", text: "グレン少佐には、ブリッジで戦術補佐をお願いします。現状、四人目を出す機体がありません。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "承知しています。出撃できないのは残念ですが、指揮支援も重要な任務です。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "副官殿、今ちょっとかっこよかったっすよ。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "では、もう一句。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "いらない。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "ちょっと待った。S型って、俺のですよね？" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "今は私が使う。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "……ですよねー。いや、軽口っすよ。初手で専用機ロストはなかなか派手にやりましたね、ってだけで。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "レイ。" },
      { speaker: "ドゥ", portrait: "character/dou.png", background: "scenario/prologue_clarent_battle_log.png", text: "補足。ティリア大佐はフランベルジュ大破時、クラレントに相打ちに近い損傷を与えています。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "へえ。相打ちって言っても、相手は無人機みたいなもんでしょ？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "クラレントの戦闘ログを開示。最大加速、有人機安全基準を大幅に超過。推定G負荷、通常パイロットの失神域を連続突破。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "パイロット保護制御、完全無視。機体関節部への負荷、設計限界値を連続して突破しています。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "……は？" },
      { speaker: "グレン", portrait: "character/glen.png", text: "つまり、相手は人間なら死ぬ動きをしていたわけですね。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "肯定。アインはAIであるため、肉体負荷を考慮する必要がありません。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "その相手に、覚醒直後の大佐が相打ちまで持ち込んだ。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "……うちの隊長も十分化け物だわ。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "感想はあと。今は船を立て直す。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "了解。S型の件、文句は……少しだけにしときます。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "少しは残るのね。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "そこは、まあ。機体愛ってことで。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "セラ、あなたの機体はハニービーB型。補給用フレームよ。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "私の適性とは合いませんね。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "ただし、スナイパーライフルを装備しています。遠距離支援は可能です。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "なら十分です。動くなら当てます。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "補給機で狙撃か。器用だな。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "あなたよりは。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "今の褒めてないよな？" },
      { speaker: "ドゥ", portrait: "character/dou.png", background: "scenario/prologue_gaia_area5.png", text: "メインエンジン予備パーツの落下地点を解析。推定位置、惑星ガイア、エリア5。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "周辺には大型の生命反応があります。探索には危険が伴います。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "危険がない選択肢は、もう残っていないわ。最初の目標はエリア5。メインエンジンを戻す。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "了解。じゃあ、まずはエリア5でひと暴れってことで。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "暴れるのは敵だけでいい。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "皆さん、無事に戻ってください。帰還を待つのも、指揮官の大事な仕事です。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "出撃準備。サーベリオンS型、サーベリオンA型、ハニービーB型で出る。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "出撃編成を登録。探索任務を開始できます。" }
    ]
  },
  prologue_004: {
    id: "prologue_004",
    title: "プロローグ：ガイア降下",
    background: "scenario/prologue_gaia_field.png",
    nextScenario: "prologue_005",
    returnScene: "bar",
    lines: [
      { speaker: "SYSTEM", background: "scenario/prologue_gaia_cockpit.png", text: "サーベリオンS型、サーベリオンA型、ハニービーB型。三機のヴァリアント・フレームが、アーク・クレイドルの残骸からガイアの大地へ降り立つ。" },
      { speaker: "ドゥ", name: "ドゥ", portrait: "character/dou.png", text: "外部大気成分を解析。酸素濃度、許容範囲。有毒成分、基準値未満。呼吸可能です。" },
      { speaker: "レイ", name: "レイ・クロード", portrait: "character/rei.png", text: "へえ。落ちた先が即死の毒ガス惑星じゃなかったのは幸運だな。" },
      { speaker: "セラ", name: "セラ・ノクティス", portrait: "character/sera.png", text: "幸運と判断するには早い。周辺の生命反応、かなり大きい。" },
      { speaker: "ティリア", name: "ティリア・ハーツ", portrait: "character/tilia.png", text: "生きられる星と、安全な星は違うわ。" },
      { speaker: "SYSTEM", background: "scenario/prologue_gaia_field.png", text: "ガイアの大気は安定していた。青い空、濃密な緑、巨大な植物群。だが、その美しさは人間のために用意されたものではない。" },
      { speaker: "グレン", name: "グレン・バルド", portrait: "character/glen.png", text: "通信状態、やや不安定。地形データもほとんどありません。皆さん、無茶は控えてください。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "副官殿、それ俺に言ってます？" },
      { speaker: "セラ", portrait: "character/sera.png", text: "あなた以外に誰がいるの。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "信頼されてんなあ、俺。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "警戒されてるの。" },
      { speaker: "ミランダ", name: "ミランダ・ワイズマン", portrait: "character/miranda.png", text: "ティリア大佐、本当に出るんですか。まだ傷も――" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "動ける。それで十分よ。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "補足。ティリア大佐の身体状態は、十分ではありません。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "ドゥ。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "訂正。作戦遂行に支障が出る可能性があります。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "支障が出たら、俺が前に出ますよ。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "最初から前に出る口実にしない。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "必要なら任せる。でも勝手に突っ込むのは禁止。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "了解。許可制で突っ込みます。" },
      { speaker: "SYSTEM", background: "scenario/prologue_cradle_wreckage.png", text: "背後には、アーク・クレイドルの破損区画が沈黙している。メインエンジンは停止し、予備動力だけがかろうじて船内を生かしていた。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "船内の予備電力は長く持ちません。農業ユニットも、クレイドルユニットも失われています。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "燃料も食料も、人員も機体も不足。まさに、ないない尽くしですね。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "その言い方、軽い。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "重く言うと、皆さんの足がさらに重くなりますので。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "現実は変わらない。なら、動くわ。" },
      { speaker: "ドゥ", portrait: "character/dou.png", background: "scenario/prologue_gaia_area5_route.png", text: "目標を再確認します。エリア5に落下したメインエンジン予備パーツの回収。優先度、最高。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "アインの追跡は……" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "後回し。アインを追うには船が必要。船を動かすには、エンジンが必要。順番を間違えれば、全員死ぬ。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "了解。じゃあ、生きて帰って、ついでに敵も倒す。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "ついでの方が大きそうね。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "こちらはブリッジで戦況を見ます。通信が途切れた場合は、各自の判断で帰還を優先してください。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "グレン、艦内の防衛も任せるわ。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "承知しました。船を守る役目、まさに留守を守るすぐれた――" },
      { speaker: "セラ", portrait: "character/sera.png", text: "通信切っていいですか。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "まだ切らないでください……" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "出撃する。アーク・クレイドルを、もう一度立たせるわ。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "探索任務、開始。" }
    ]
  },
  prologue_005: {
    id: "prologue_005",
    title: "プロローグ：機械蟲",
    background: "scenario/prologue_machine_insect.png",
    nextScenario: "prologue_006",
    returnScene: "bar",
    lines: [
      { speaker: "SYSTEM", background: "scenario/prologue_gaia_field.png", text: "三機のヴァリアント・フレームは、ガイアの密林を進む。地形データは不完全で、センサーの反応も安定しない。" },
      { speaker: "セラ", name: "セラ・ノクティス", portrait: "character/sera.png", text: "地形照合、失敗。船の観測データと実地形が一致しない。" },
      { speaker: "レイ", name: "レイ・クロード", portrait: "character/rei.png", text: "墜落で地形が変わったとか？" },
      { speaker: "ドゥ", name: "ドゥ", portrait: "character/dou.png", text: "可能性あり。アーク・クレイドル由来の破片反応が、周辺に複数散在しています。" },
      { speaker: "SYSTEM", background: "scenario/prologue_cradle_wreckage_overgrown.png", text: "折れた船体装甲が、巨木の根に抱え込まれている。金属板の裂け目には、脈打つ蔦のような組織が入り込んでいた。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "……なんか、船の破片に植物が食い込んでないか？" },
      { speaker: "セラ", portrait: "character/sera.png", text: "食い込んでいる、というより……絡みついている。違う。癒着している？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "船体外装材の表面に、有機組織の侵入を確認。通常の腐食反応ではありません。" },
      { speaker: "グレン", name: "グレン・バルド", portrait: "character/glen.png", text: "無機物に根を張る植物、ですか。ずいぶん食欲旺盛な星ですね。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "冗談にしては笑えない。" },
      { speaker: "ティリア", name: "ティリア・ハーツ", portrait: "character/tilia.png", text: "回収が遅れれば、予備パーツも同じ状態になる可能性がある。急ぐわ。" },
      { speaker: "ミランダ", name: "ミランダ・ワイズマン", portrait: "character/miranda.png", text: "大佐、前方に大型生命反応です。距離、急速に接近。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "こちらでも捕捉。大きい。少なくとも、私たちの機体より上。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "初回からずいぶん歓迎されてるな。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "来るわ。構えて。" },
      { speaker: "SYSTEM", background: "scenario/prologue_machine_insect_shadow.png", text: "木々が大きく揺れた。湿った土を割り、金属を擦るような音が近づいてくる。" },
      { speaker: "SYSTEM", background: "scenario/prologue_machine_insect.png", text: "姿を現したのは、巨大な蟲型の化け物だった。外殻には船体装甲の破片が混ざり、背中ではケーブルのような神経束が脈打っている。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "なんだ、あれ……。機械を食ってるのか？" },
      { speaker: "セラ", portrait: "character/sera.png", text: "違う。食べてるというより、混ざってる。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "敵性体表面に、アーク・クレイドル由来の金属反応を確認。船体外装材、補助ケーブル、フレーム破片と一致。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "つまり、墜落した船の破片を取り込んでいる？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "推定。ただし、接合面に拒絶反応は見られません。有機組織と無機構造が融合しています。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "ガイアの生命体は、機械と融合する……？" },
      { speaker: "SYSTEM", background: "scenario/prologue_machine_insect_voice.png", text: "蟲型生命体が頭部を震わせる。装甲の隙間から、割れた音声のようなものが漏れた。" },
      { speaker: "機械蟲", name: "機械蟲", text: "――ぁ、――れ、――な、――" },
      { speaker: "レイ", portrait: "character/rei.png", text: "……今、喋ったか？" },
      { speaker: "セラ", portrait: "character/sera.png", text: "音声に聞こえた。でも、言葉としては認識できない。" },
      { speaker: "機械蟲", name: "機械蟲", text: "――た、――け、――こ、――ろ、――" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "人の声……？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "解析不能。音声波形に人語との類似あり。意味内容の特定に失敗。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "アインの信号は？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "現時点では検出されていません。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "じゃあ、こいつは何なんだよ。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "この星の生き物。たぶん、それだけ。" },
      { speaker: "SYSTEM", background: "scenario/prologue_machine_insect_voice.png", text: "機械蟲が絶叫する。人語のような響きは、すぐに獣じみた咆哮へ崩れていく。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "来る。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "戦闘態勢。レイ、前衛。セラ、射線を確保。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "今度は許可ありですね。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "ええ。止めるわよ。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "敵性体、接近。戦闘開始まで、三、二、一――" }
    ]
  },
  prologue_006: {
    id: "prologue_006",
    title: "プロローグ：反響する声",
    background: "scenario/prologue_machine_insect_dead.png",
    returnScene: "bar",
    lines: [
      { speaker: "SYSTEM", background: "scenario/prologue_machine_insect_dead.png", text: "戦闘は終わった。巨大な機械蟲は崩れ落ち、外殻に癒着していた金属片が、湿った音を立てて剥がれていく。" },
      { speaker: "レイ", name: "レイ・クロード", portrait: "character/rei.png", text: "……倒した、よな？" },
      { speaker: "セラ", name: "セラ・ノクティス", portrait: "character/sera.png", text: "生命反応、停止。少なくとも、動く気配はない。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "気持ち悪い敵だったな。見た目もだけど、声が。" },
      { speaker: "ティリア", name: "ティリア・ハーツ", portrait: "character/tilia.png", text: "ドゥ、解析は。" },
      { speaker: "ドゥ", name: "ドゥ", portrait: "character/dou.png", background: "scenario/prologue_metallic_nerve.png", text: "敵性体内部から、金属化した神経組織を検出。有機組織と無機素材が一体化しています。" },
      { speaker: "グレン", name: "グレン・バルド", portrait: "character/glen.png", text: "金属化した神経……ですか。生物なのか機械なのか、判断に困りますね。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "分類不能。ただし、融合という表現が最も近いと判断します。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "融合。寄生でも、捕食でもなく？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "肯定。接合面に拒絶反応は確認できません。無機素材が、敵性体自身の構造として利用されています。" },
      { speaker: "ミランダ", name: "ミランダ・ワイズマン", portrait: "character/miranda.png", text: "では、船体の破片も……" },
      { speaker: "ドゥ", portrait: "character/dou.png", background: "scenario/prologue_cradle_wreckage_overgrown.png", text: "すでに複数箇所で取り込まれている可能性があります。アーク・クレイドル由来の外装材、補助ケーブル、フレーム破片を確認済み。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "それ、つまり急がないとまずいってことか。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "落ちた部品が、全部この星の生き物に取り込まれるかもしれない。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "メインエンジンの予備パーツも例外じゃないわね。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "肯定。回収が遅れるほど、対象部品の原形維持率は低下すると推定されます。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "最初の敵でこれかよ。歓迎ムードが独特すぎるだろ、この星。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "歓迎ではないと思う。たぶん、消化。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "もっと嫌な言い方ある？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "補足。先ほどの敵性体音声について、記録波形を再解析しました。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "結果は。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "人語との類似を確認。ただし、言語構造としては成立していません。意味理解を伴う発話ではないと推定。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "では、あれはただの鳴き声……？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "断定不可。音声波形の一部に、アインの記録音声と近似する成分があります。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "アイン？ じゃあ、あいつが操ってたのか？" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "否定。アインの制御信号は検出されていません。先ほどの個体がアインに操作されていた証拠はありません。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "でも、声だけは似ていた。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "はい。制御ではなく、混入、あるいは反響に近い現象の可能性があります。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "反響。つまり、誰かの声が、別の喉で鳴っているようなものですか。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "比喩としては、おおむね適切です。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "今は保留。アイン本人と断定するには情報が足りない。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "けど、無関係とも言い切れない。" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "ええ。だから記録しておく。忘れないで。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "音声記録、保存済み。以後の探索中も類似波形を監視します。" },
      { speaker: "ミランダ", portrait: "character/miranda.png", text: "大佐、このまま進むんですか？" },
      { speaker: "ティリア", portrait: "character/tilia.png", text: "進むわ。ここで立ち止まれば、船も、眠っている人たちも助からない。" },
      { speaker: "レイ", portrait: "character/rei.png", text: "了解。次からは、喋る虫が出ても驚かないようにします。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "驚かないのは無理。黙って撃つだけ。" },
      { speaker: "グレン", portrait: "character/glen.png", text: "では皆さん、引き続きお気をつけて。虫の知らせ、というには大きすぎますからね。" },
      { speaker: "セラ", portrait: "character/sera.png", text: "今の通信、切っていい？" },
      { speaker: "ティリア", portrait: "character/tilia.png", background: "scenario/prologue_gaia_area5_route.png", text: "進路はエリア5。メインエンジン予備パーツを回収する。" },
      { speaker: "ドゥ", portrait: "character/dou.png", text: "探索任務を継続します。" }
    ]
  }
};

function scenarioDefaultState() {
  return {
    active: false,
    currentId: null,
    index: 0,
    returnScene: "bar",
    seen: {}
  };
}

function escapeScenarioHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

window.ensureScenarioState = function ensureScenarioState(source) {
  const current = source && typeof source === "object" ? source : window.GameState.scenario;
  const fallback = scenarioDefaultState();
  window.GameState.scenario = {
    active: Boolean(current?.active),
    currentId: typeof current?.currentId === "string" ? current.currentId : null,
    index: Math.max(0, Math.floor(Number(current?.index || 0))),
    returnScene: typeof current?.returnScene === "string" ? current.returnScene : fallback.returnScene,
    seen: current?.seen && typeof current.seen === "object" ? current.seen : {}
  };
  return window.GameState.scenario;
};

function currentScenarioEntry() {
  const state = window.GameState.scenario;
  return state.currentId ? window.ScenarioCatalog[state.currentId] : null;
}

window.startScenario = function startScenario(scenarioId, returnScene = "bar") {
  const scenario = window.ScenarioCatalog[scenarioId];
  if (!scenario) return false;
  const state = window.ensureScenarioState();
  state.active = true;
  state.currentId = scenario.id;
  state.index = 0;
  state.returnScene = returnScene || scenario.returnScene || "bar";
  window.renderScenario();
  return true;
};

window.tryStartInitialScenario = function tryStartInitialScenario() {
  const state = window.ensureScenarioState();
  if (state.seen.prologue_001 || state.active) return false;
  return window.startScenario("prologue_001", window.ScenarioCatalog.prologue_001.returnScene);
};

window.advanceScenario = function advanceScenario() {
  const state = window.ensureScenarioState();
  const scenario = currentScenarioEntry();
  if (!state.active || !scenario) return false;
  state.index += 1;
  if (state.index >= (scenario.lines || []).length) {
    window.finishScenario({ startNext: true });
    return true;
  }
  window.renderScenario();
  return true;
};

window.skipScenario = function skipScenario() {
  return window.finishScenario();
};

window.resetScenarioSeen = function resetScenarioSeen(scenarioId) {
  const state = window.ensureScenarioState();
  if (scenarioId) {
    delete state.seen[scenarioId];
  } else {
    state.seen = {};
  }
  if (typeof window.savePlayerData === "function") window.savePlayerData();
  if (typeof window.renderCurrentScene === "function") window.renderCurrentScene();
  return true;
};

window.finishScenario = function finishScenario(options = {}) {
  const state = window.ensureScenarioState();
  const scenarioId = state.currentId;
  const scenario = scenarioId ? window.ScenarioCatalog[scenarioId] : null;
  const returnScene = state.returnScene || "bar";
  if (scenarioId) state.seen[scenarioId] = true;
  const nextScenario = options.startNext && scenario?.nextScenario
    ? window.ScenarioCatalog[scenario.nextScenario]
    : null;
  if (nextScenario) {
    state.active = true;
    state.currentId = nextScenario.id;
    state.index = 0;
    state.returnScene = nextScenario.returnScene || returnScene;
    if (typeof window.savePlayerData === "function") window.savePlayerData();
    window.renderScenario();
    return true;
  }
  state.active = false;
  state.currentId = null;
  state.index = 0;
  state.returnScene = "bar";
  window.GameState.currentScene = returnScene;
  if (typeof window.savePlayerData === "function") window.savePlayerData();
  if (typeof window.renderCurrentScene === "function") window.renderCurrentScene();
  return true;
};

window.renderScenario = function renderScenario() {
  const root = window.App?.root || document.getElementById("app");
  if (!root) return false;
  const state = window.ensureScenarioState();
  const scenario = currentScenarioEntry();
  if (!state.active || !scenario) {
    if (typeof window.renderCurrentScene === "function") window.renderCurrentScene();
    return false;
  }
  const lines = Array.isArray(scenario.lines) ? scenario.lines : [];
  const line = lines[state.index] || {};
  const speaker = line.name || line.speaker || "";
  const isSystemLine = String(line.speaker || "").toUpperCase() === "SYSTEM";
  const background = line.background || scenario.background || "";
  const progress = `${Math.min(state.index + 1, Math.max(lines.length, 1))} / ${Math.max(lines.length, 1)}`;
  const backgroundHtml = background
    ? `<img class="scenario-background" src="${escapeScenarioHtml(background)}" alt="" onerror="this.remove()">`
    : "";
  const portraitHtml = line.portrait && !isSystemLine
    ? `<img class="scenario-portrait" src="${escapeScenarioHtml(line.portrait)}" alt="${escapeScenarioHtml(speaker)}" onerror="this.remove()">`
    : "";
  root.innerHTML = `
    <section class="scenario-screen" data-scenario="${escapeScenarioHtml(scenario.id)}">
      <div class="scenario-header">
        <div class="scenario-title">${escapeScenarioHtml(scenario.title || scenario.id)}</div>
        <div class="scenario-progress">${escapeScenarioHtml(progress)}</div>
      </div>
      <div class="scenario-visual">
        ${backgroundHtml}
      </div>
      <div class="scenario-dialogue">
        ${portraitHtml}
        <div class="scenario-speaker">${escapeScenarioHtml(speaker)}</div>
        <p class="scenario-text">${escapeScenarioHtml(line.text || "")}</p>
        <div class="scenario-actions">
          <button class="button scenario-skip" data-action="scenario-skip" type="button">スキップ</button>
          <button class="button scenario-next" data-action="scenario-next" type="button">次へ</button>
        </div>
      </div>
    </section>
  `;
  return true;
};
