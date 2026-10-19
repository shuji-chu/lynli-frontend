const API = 'https://spider.lynli.me';

async function startSpider() {
    const kw = document.getElementById('keyword').value;
    if (!kw) return alert('请输入关键词');
    
    const loading = document.getElementById('loading');
    const list = document.getElementById('list');
    loading.style.display = 'block';
    list.innerHTML = '';

    try {
        await fetch(`${API}/api/v1/admin/spider/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: kw })
        });
        setTimeout(loadDrafts, 3000);
    } catch (err) {
        alert('请求失败');
        loading.style.display = 'none';
    }
}

async function loadDrafts() {
    const loading = document.getElementById('loading');
    const list = document.getElementById('list');
    
    try {
        const res = await fetch(`${API}/api/v1/admin/spider/list`);
        const data = await res.json();
        loading.style.display = 'none';

        if (data.code !== 1) throw new Error(data.msg);

        if (data.data.length === 0) {
            list.innerHTML = '<div style="color:#64748b; text-align:center; padding:20px;">暂无草稿数据，请抓取。</div>';
            return;
        }

        list.innerHTML = data.data.map(item => `
            <div class="card" id="card-${item.id}">
                <img src="${item.image_url.replace('http://', 'https://')}">
                <div class="card-body">
                    <div class="title">${item.title}</div>
                    <div class="price-row">
                        <span style="color:#64748b; font-size:12px;">进价: ¥${item.price}</span>
                        <span style="font-size:12px;">售价: ¥<input type="number" class="price-input" id="price-${item.id}" value="${Math.floor(item.price * 3)}"></span>
                    </div>
                    <div class="actions">
                        <button class="btn-up" onclick="publish(${item.id})">上架</button>
                        <button class="btn-del" onclick="discard(${item.id})">丢弃</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        loading.style.display = 'none';
        list.innerHTML = '<div style="color:red; text-align:center; padding:20px;">拉取失败</div>';
    }
}

async function publish(id) {
    const price = document.getElementById(`price-${id}`).value;
    const btn = event.target;
    btn.innerText = '处理中';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/api/v1/admin/spider/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, price })
        });
        const data = await res.json();
        alert(data.msg);
        
        if (data.code === 1) {
            document.getElementById(`card-${id}`).remove();
        } else {
            btn.innerText = '上架';
            btn.disabled = false;
        }
    } catch (err) {
        alert('失败');
        btn.innerText = '上架';
        btn.disabled = false;
    }
}

async function discard(id) {
    if (!confirm('确定丢弃吗？')) return;
    
    const btn = event.target;
    btn.innerText = '删除中';
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/api/v1/admin/spider/discard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        
        if ((await res.json()).code === 1) {
            document.getElementById(`card-${id}`).remove();
        } else {
            btn.innerText = '丢弃';
            btn.disabled = false;
        }
    } catch (err) {
        alert('失败');
        btn.innerText = '丢弃';
        btn.disabled = false;
    }
}

loadDrafts();
