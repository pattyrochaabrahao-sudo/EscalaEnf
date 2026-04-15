import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if (msg.type() === 'error') console.log('BROWSER CONSOLE ERROR:', msg.text());
        });
        page.on('pageerror', err => {
            console.log('BROWSER PAGE ERROR:', err.toString());
        });
        
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
        
        // Login as Lideranca
        await page.evaluate(() => {
            const selects = document.querySelectorAll('select');
            selects[0].value = 'Liderança';
            selects[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
        await new Promise(r => setTimeout(r, 200));

        await page.type('input[type="password"]', '123');

        await page.evaluate(() => {
            const selects = document.querySelectorAll('select');
            selects[1].value = '03DN';
            selects[1].dispatchEvent(new Event('change', { bubbles: true }));
        });
        await new Promise(r => setTimeout(r, 200));

        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log("Logged in!");
        
        await page.evaluate(() => {
            const req = [{ colabId: 1, nome: "Maria Silva", mes: new Date().getMonth(), ano: new Date().getFullYear(), dia: 5, status: 'Pendente' }];
            localStorage.setItem('pedidosFolga', JSON.stringify(req));
        });
        await page.reload({ waitUntil: 'networkidle0' });

        await page.waitForSelector('table', { timeout: 5000 });
        
        console.log("Clicking Limpar...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const limpar = btns.find(b => b.innerText.toUpperCase().includes('LIMPAR'));
            if(limpar) limpar.click();
        });
        
        // Wait to see if error triggers
        await new Promise(r => setTimeout(r, 1000));
        
        console.log("Clicking Day 5 to open Modal...");
        await page.evaluate(() => {
            const cells = document.querySelector('table tbody').querySelectorAll('tr')[0].querySelectorAll('td');
            cells[8].click();
        });
        await new Promise(r => setTimeout(r, 1000));

        console.log("Clicking Aprovar...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const aprov = btns.find(b => b.innerText.includes('Aprovar'));
            if(aprov) aprov.click();
        });
        await new Promise(r => setTimeout(r, 2000));

        await browser.close();
        console.log("DONE!");
    } catch(e) {
        console.log("PUPPETEER ERROR:", e);
    }
})();
