// ====== 扩充版的复古电影与文学数据集 ======
// 新增了 videoUrl 字段，用于存放视频链接
const mockDatabase = [
    {
        keyword: ["绿", "庄园", "夏日", "打字机", "裙子", "绿裙子", "欲望", "赎罪"],
        literature: {
            book: "《赎罪》- 伊恩·麦克尤恩",
            quote: "“那是一个气温高得惊人的夏日。阳光像一层厚重的蜂蜜涂抹在庄园的草坪上...她穿上那件露背的祖母绿丝绸晚礼服，布料滑过肌肤的声音像是一场秘密的叹息。”"
        },
        movie: {
            film: "🎬 匹配影像：《赎罪》(Atonement, 2007)",
            description: "塞西莉亚穿着那件名垂影史的祖母绿丝绸露背裙，在英国乡村庄园的藏书室里。画面呈现出油画般浓郁的黄绿色调，充满燥热与压抑的暧昧。"
        },
        // 这里可以填入B站或真实视频的 iframe 链接，这里用一个测试视频代替演示
        videoUrl:`<iframe src="//player.bilibili.com/player.html?bvid=BV1Nu411B7Vk&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`
    },
    {
        keyword: ["旗袍", "雨", "巷弄", "暧昧", "夜", "路灯", "背影", "香港"],
        literature: {
            book: "《对倒》- 刘以鬯",
            quote: "“那些消逝了的岁月，仿佛隔着一块积着灰尘的玻璃，看得到，抓不着。雨滴在屋檐上敲击出单调的节奏，路灯把她的影子拉得很长...”"
        },
        movie: {
            film: "🎬 匹配影像：《花样年华》(In the Mood for Love, 2000)",
            description: "苏丽珍穿着高领印花旗袍走在潮湿狭窄的楼梯上。画面被深沉的红调和黯淡的黄晕笼罩，每一帧都是难以言说的克制与浪漫。"
        },
        videoUrl:`<iframe src="//player.bilibili.com/player.html?bvid=BV1sL411p7eN&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`
    },
    {
        keyword: ["派对", "爵士", "烟", "金", "繁华", "孤独", "烟花", "纽约"],
        literature: {
            book: "《了不起的盖茨比》- F.S. 菲茨杰拉德",
            quote: "“大厅里光怪陆离，华乐奏响，金色的香槟酒像瀑布般倾泻。男男女女像飞蛾一般在笑语、香槟和繁星中穿梭。在这个蓝色的花园里，一切仿佛都是不朽的。”"
        },
        movie: {
            film: "🎬 匹配影像：《了不起的盖茨比》(The Great Gatsby, 2013)",
            description: "镜头掠过漫天飘洒的金箔与礼花，盖茨比在复古华丽的大厅中举起酒杯。充斥着1920年代爵士时代的纸醉金迷。"
        },
        videoUrl: `<iframe src="//player.bilibili.com/player.html?bvid=BV1a34y1S72i&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`
    },
    {
        keyword: ["冬天", "雪", "遗憾", "白", "信", "青春", "暗恋", "山"],
        literature: {
            book: "《情书》- 岩井俊二",
            quote: "“满眼都是白茫茫的雪。如果真的有天国，那里的雪也一定会像这样，把所有的悲伤都静静地掩盖起来吧。你好吗？我很好。”"
        },
        movie: {
            film: "🎬 匹配影像：《情书》(Love Letter, 1995)",
            description: "渡边博子在纯白的小樽雪地里奔跑，对着茫茫雪山大声呼喊。呈现出90年代日本电影特有的清冷蓝白色调与胶片柔光。"
        },
        videoUrl: `<iframe src="//player.bilibili.com/player.html?bvid=BV17p421m79q&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`
    },
    {
        keyword: ["清晨", "雾", "荒野", "告白", "高傲", "古典", "散步"],
        literature: {
            book: "《傲慢与偏见》- 简·奥斯汀",
            quote: "“如果你的心意还和过去一样，请你马上告诉我；我的心愿和情感依然如旧……但只要你一句话，我就会永远闭嘴。”"
        },
        movie: {
            film: "🎬 匹配影像：《傲慢与偏见》(Pride & Prejudice, 2005)",
            description: "达西先生在清晨的薄雾中，穿过挂满露珠的荒野向伊丽莎白走来。灰蓝色的冷调晨光与古典英伦风光完美交融。"
        },
        videoUrl: '<iframe src="//player.bilibili.com/player.html?bvid=BV1q3411u7oT&page=1&high_quality=1&danmaku=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>'
    },
    
    {
        keyword: ["对称", "粉色", "荒诞", "酒店", "雪山", "油画", "童话"],
        literature: {
            book: "《昨日的世界》- 斯蒂芬·茨威格",
            quote: "“那是一个逝去的黄金时代，一切似乎都井然有序，人们在华丽的穹顶下谈论艺术与诗歌，却不知深渊正在逼近。”"
        },
        movie: {
            film: "🎬 匹配影像：《布达佩斯大饭店》(The Grand Budapest Hotel, 2014)",
            description: "极度强迫症般的居中对称构图，搭配马卡龙般甜美的粉色与淡蓝色调，像一本精致却略带忧伤的立体童话书。"
        },
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
];

// 搜索逻辑
function executeSearch() {
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const container = document.getElementById('resultsContainer');

    if (!searchInput) {
        container.innerHTML = `<div style="text-align: center; color: var(--accent-red); font-style: italic;">请在打字机前留下您的意象。</div>`;
        return;
    }

    container.innerHTML = `<div style="text-align: center; color: var(--gold); letter-spacing: 2px;">[ 正在暗房中显影底片... ]</div>`;

    setTimeout(() => {
        // 模糊匹配逻辑
        const results = mockDatabase.filter(item => 
            item.keyword.some(kw => searchInput.includes(kw) || kw.includes(searchInput)) ||
            item.literature.book.includes(searchInput)
        );

        renderResults(results);
    }, 800);
}

// 渲染结果（新增了播放按钮）
function renderResults(results) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; 

    if (results.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #9a9386; font-style: italic; line-height: 2;">
                胶片库中暂无此意象的存档。<br>请尝试输入：<span style="color:var(--gold)">绿、雪、旗袍、派对、雾、粉色、遗憾、夏日...</span>
            </div>`;
        return;
    }

    results.forEach(data => {
        // 注意看这里加了一个 button，并且绑定了 openVideo 函数，传入视频链接
        const cardHTML = `
            <div class="result-item">
                <div class="literature-section">
                    <div class="tag-line">Chapter / 纸页上的字句</div>
                    <p class="literature-text">${data.literature.quote}</p>
                    <div class="book-title">—— ${data.literature.book}</div>
                </div>
                
                <div class="movie-match">
                    <div class="tag-line" style="color: #e6dcc8;">Frame / 显影的胶片</div>
                    <h4 class="movie-title">${data.movie.film}</h4>
                    <p class="movie-desc">${data.movie.description}</p>
                    <button class="play-btn" data-video='${encodeURIComponent(data.videoUrl)}' onclick="openVideo(this)">
🎬 放映此幕
</button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}


// ====== 升级版视频播放器逻辑 ======
const videoModal = document.getElementById('videoModal');
const videoPlayerBox = document.getElementById('videoPlayerBox');

function openVideo(btn) {
    const urlOrCode = decodeURIComponent(btn.dataset.video);

    videoModal.style.display = 'flex';

    if (urlOrCode.trim().startsWith('<iframe')) {
        videoPlayerBox.innerHTML = urlOrCode;
    } else {
        videoPlayerBox.innerHTML = `
            <video controls autoplay>
                <source src="${urlOrCode}" type="video/mp4">
            </video>
        `;
    }
}

// 关闭视频弹窗，并清空播放器（停止声音）
function closeVideo() {
    videoModal.style.display = 'none';
    videoPlayerBox.innerHTML = ''; 
}


// 支持回车键搜索
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        executeSearch();
    }
});