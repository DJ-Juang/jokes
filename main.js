// ==========================================
// 1. 全域變數宣告
// ==========================================
let allJokes = []; 
let currentMode = 'all';
let currentPage = 1;
const itemsPerPage = 6;
let searchQuery = '';
let favoriteIds = JSON.parse(localStorage.getItem('joke_favorites')) || [];

// ==========================================
// 2. 工具型函式 (HTML 逃逸)
// ==========================================
function escapeHtml(string) {
    return String(string).replace(/[&<>\"']/g, function (s) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[s];
    });
}

// ==========================================
// 3. 核心渲染功能 (確保放在執行動作之前)
// ==========================================
function renderJokes() {
    let filtered = allJokes.filter(joke => {
        if (currentMode === 'fav' && !favoriteIds.includes(joke.id)) return false;
        return true;
    });

    if (searchQuery) {
        filtered = filtered.filter(joke => 
            joke.title.toLowerCase().includes(searchQuery) || 
            joke.content.toLowerCase().includes(searchQuery)
        );
    }

    const container = document.getElementById('jokes-container');
    const paginationContainer = document.getElementById('pagination');
    
    // 防呆：如果找不到容器就不執行
    if (!container || !paginationContainer) return;

    container.innerHTML = '';
    
    // 更新 Header 的數量顯示
    const tabAll = document.getElementById('tab-all');
    const tabFav = document.getElementById('tab-fav');
    if (tabAll) tabAll.innerText = `全部笑話 (${allJokes.length})`;
    if (tabFav) tabFav.innerText = `我的收藏 ❤️ (${favoriteIds.length})`;

    if (filtered.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">找不到相關的笑話 😢</p>';
        paginationContainer.innerHTML = '';
        return;
    }

    // 分頁邏輯
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filtered.slice(startIndex, endIndex);

    // 產生卡片
    pageItems.forEach(joke => {
        const isFav = favoriteIds.includes(joke.id);
        const card = document.createElement('div');
        card.className = 'joke-card';
        card.onclick = () => openModal(joke.title, joke.content);
        
        // 內容預覽（取出前 40 個字並加上 ...）
        const contentPreview = joke.content.length > 40 ? joke.content.substring(0, 40) + '...' : joke.content;

        // 💡 重新調整卡片內部結構：加入左側序號區區塊
        card.innerHTML = `
            <div style="display: flex; gap: 15px; align-items: flex-start; width: 100%;">
                <div class="joke-number" style="font-size: 18px; font-weight: bold; color: var(--primary-color); opacity: 0.7; padding-top: 2px; min-width: 35px;">
                    #${joke.id}
                </div>
                
                <div style="flex: 1; padding-right: 20px;">
                    <div class="joke-title" style="margin-bottom: 5px; padding-right: 0;">${escapeHtml(joke.title)}</div>
                    <div class="joke-preview" style="font-size: 14px; color: var(--text-muted); line-height: 1.5; white-space: pre-line;">
                        ${escapeHtml(contentPreview)}
                    </div>
                </div>
            </div>
            
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${joke.id});" style="position: absolute; top: 15px; right: 15px;">
                ${isFav ? '❤️' : '🤍'}
            </button>
        `;
        container.appendChild(card);
    });

    // 產生分頁按鈕
    paginationContainer.innerHTML = '';
    if (totalPages > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerText = '上一頁';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => changePage(currentPage - 1);
        paginationContainer.appendChild(prevBtn);

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => changePage(i);
            paginationContainer.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerText = '下一頁';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => changePage(currentPage + 1);
        paginationContainer.appendChild(nextBtn);
    }
}

// ==========================================
// 4. 綁定給 HTML onclick 使用的全域函式
// ==========================================
window.switchMode = function(mode) {
    currentMode = mode;
    currentPage = 1;
    const tabAll = document.getElementById('tab-all');
    const tabFav = document.getElementById('tab-fav');
    if (tabAll) tabAll.classList.toggle('active', mode === 'all');
    if (tabFav) tabFav.classList.toggle('active', mode === 'fav');
    renderJokes();
};

window.handleSearch = function() {
    const searchInput = document.getElementById('search-input');
    searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
    currentPage = 1;
    renderJokes();
};

window.changePage = function(page) {
    currentPage = page;
    renderJokes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.toggleFavorite = function(id) {
    const index = favoriteIds.indexOf(id);
    if (index === -1) {
        favoriteIds.push(id);
    } else {
        favoriteIds.splice(index, 1);
    }
    localStorage.setItem('joke_favorites', JSON.stringify(favoriteIds));
    renderJokes();
};

window.openModal = function(title, content) {
    const mTitle = document.getElementById('modal-joke-title');
    const mBody = document.getElementById('modal-joke-body');
    const modal = document.getElementById('joke-modal');
    if (mTitle) mTitle.innerText = title;
    if (mBody) mBody.innerText = content;
    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function() {
    const modal = document.getElementById('joke-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
};

// ==========================================
// 5. 從伺服器非同步讀取 JSON 的函式
// ==========================================
async function loadJokesFromServer() {
    try {
        const response = await fetch('./jokes.json');
        if (!response.ok) {
            throw new Error('無法讀取笑話資料庫');
        }
        allJokes = await response.json();
        
        // 此時上面的 renderJokes 已經定義好了，可以安全執行！
        renderJokes(); 
    } catch (error) {
        console.error('錯誤:', error);
        const container = document.getElementById('jokes-container');
        if (container) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:red;">笑話載入失敗，請檢查網路或格式。</p>';
        }
    }
}

// ==========================================
// 6. 整個檔案的最底部，啟動執行
// ==========================================
loadJokesFromServer();
