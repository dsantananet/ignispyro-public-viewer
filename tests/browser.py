from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import threading,pathlib,json
root=pathlib.Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 chrome=pathlib.Path(r'C:\Program Files\Google\Chrome\Application\chrome.exe')
 browser=p.chromium.launch(**({'executable_path':str(chrome)} if chrome.exists() else {}),headless=True)
 page=browser.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(f'http://127.0.0.1:{server.server_port}')
 page.locator('#file').set_input_files(str(root/'example.geojson'))
 page.wait_for_function("document.querySelector('#status').textContent.includes('1 elementos')")
 assert page.locator('svg circle').count()==1
 hostile={'type':'FeatureCollection','features':[{'type':'Feature','properties':{'name':'<img src=x onerror=alert(1)>'},'geometry':{'type':'Point','coordinates':[0,0]}}]}
 page.locator('#file').set_input_files({'name':'hostile.geojson','mimeType':'application/json','buffer':json.dumps(hostile).encode()})
 page.wait_for_function("document.querySelector('#details').textContent.includes('<img')")
 assert page.locator('#details img').count()==0
 page.locator('#file').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{}'})
 page.wait_for_function("document.querySelector('#status').textContent.includes('inválida')")
 assert page.locator('svg circle').count()==0
 page.locator('#file').set_input_files(str(root/'example.geojson'))
 page.wait_for_function("document.querySelector('#status').textContent.includes('1 elementos')")

 assert not errors,errors
 browser.close()
server.shutdown()
print('Browser PASS: upload, SVG, XSS text-only, invalid schema reset, no script errors')
