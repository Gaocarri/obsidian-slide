// 是否是1，2个#号
function isMain(str) {
  return (/^#{1,2}(?!#)/).test(str)
}
// 是否是3个#号的
function isSub(str) {
  return (/^#{3}(?!#)/).test(str)
}

function convert(raw) {
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(i => i != '').map(i => i.trim())
  let html = ``

  for (let i = 0; i < arr.length; i++) {
    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {
        // 平级
        html += `
              <section data-markdown>
                  <textarea data-template>
                    ${arr[i]}
                  </textarea>
              </section>
  `
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
        // 开
        html += `
             <section>
               <section data-markdown>
                 <textarea data-template>
                  ${arr[i]}
                 </textarea>
              </section>
            `
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
        // 平级
        html += `
              <section data-markdown>
                  <textarea data-template>
                    ${arr[i]}
                  </textarea>
              </section>
            `
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
        // 闭合
        html += `
               <section data-markdown>
                  <textarea data-template>
                    ${arr[i]}
                  </textarea>
               </section>
            </section>
            `
      }
    } else {
      if (isMain(arr[i])) {
        // 平级
        html += `
              <section data-markdown>
                  <textarea data-template>
                    ${arr[i]}
                  </textarea>
              </section>
              `
      } else if (isSub(arr[i])) {
        // 闭合
        html += `
              <section data-markdown>
                  <textarea data-template>
                    ${arr[i]}
                  </textarea>
              </section>
            </section>
              `
      }
    }
  }
  return html
}
// DOM方法
function $(s) {
  return document.querySelector(s)
}
function $$(s) {
  return document.querySelectorAll(s)
}

const Menu = {
  init() {
    this.$settingIcon = $('.control .icon-settings')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')

    this.bind()
  },
  // 绑定事件
  bind() {
    this.$settingIcon.onclick = () => {
      // 这里如果使用普通的函数写法this会指向settingIcon
      this.$menu.classList.add('open')
    }
    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove('open')
    }

    this.$$tabs.forEach($tab => $tab.onclick = () => {
      this.$$tabs.forEach($node => $node.classList.remove('active'))
      $tab.classList.add('active')
      let index = [...this.$$tabs].indexOf($tab)
      this.$$contents.forEach($node => $node.classList.remove('active'))
      this.$$contents[index].classList.add('active')
    })
  }
}

const ImgUploader = {
  init() {
    this.$fileInput = $('#img-uploader')
    this.$textarea = $('.editor textarea')

    AV.init({
      appId: "yffE6HyyuQsu06EFFoYdvKRq-gzGzoHsz",
      appKey: "DxYM0EXpau7e2ntV5KAB3xCJ",
      serverURLs: "https://yffe6hyy.lc-cn-n1-shared.com"
    })

    this.bind()
  },

  bind() {
    let self = this
    this.$fileInput.onchange = function () {
      if (this.files.length > 0) {
        let localFile = this.files[0]
        console.log(localFile)
        if (localFile.size / 1048576 > 2) {
          alert('文件不能超过2M')
          return
        }
        self.insertText(`![上传中，进度0%]()`)
        let avFile = new AV.File(encodeURI(localFile.name), localFile)
        avFile.save({
          keepFileName: true,
          onprogress(progress) {
            self.insertText(`![上传中，进度${progress.percent}%]()`)
          }
        }).then(file => {
          console.log('文件保存完成')
          console.log(file)
          let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
          self.insertText(text)
        }).catch(err => window.alert(`leanCloud域名过期${err}`))
      }
    }
  },

  insertText(text = '') {
    let $textarea = this.$textarea
    let start = $textarea.selectionStart
    let end = $textarea.selectionEnd
    let oldText = $textarea.value

    $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`
    $textarea.focus()
    $textarea.setSelectionRange(start, start + text.length)
  }
}


const Editor = {
  init() {
    this.$editInput = $('.editor textarea')
    this.$saveBtn = $('.editor .button-save')
    this.markdown = localStorage.markdown || `# obsidian slide
点击页面右下角箭头开始
##  
* 请将鼠标放置在页面左上方
* 点击小齿轮，开始编辑Markdown
* 更多参考请点击下一页
## 关于Obsidian Slide
### 一款在线ppt编辑器
* 基于reveal.js
* 更快、更轻
* 更简洁、更高效
### 功能
* Markdown语法制作ppt
* 图片上传
* 多种主题与动画
* PDF下载
* 演讲者模式 
## 快速上手
* 你只需要使用Markdown语法编辑即可
* '#'与'##'将占据一页横向页面
* '###'  将占据一页垂直页面
## [前往我的GitHub](https://github.com/Gaocarri/obsidian-slide/) 
    `
    // 给editor初始数据
    this.$editInput.value = this.markdown
    this.bind()
    this.start()
  },
  bind() {
    this.$saveBtn.onclick = () => {
      localStorage.markdown = this.$editInput.value
      location.reload()

    }
  },
  start() {
    document.querySelector('.slides').innerHTML = convert(this.markdown)
    // 调用原本的reveal.js
    // More info https://github.com/hakimel/reveal.js#configuration
    Reveal.initialize({
      controls: true,
      progress: true,
      center: localStorage.align === "top-left" ? false : true,
      hash: true,

      transition: localStorage.transition || 'slide', // none/fade/slide/convex/concave/zoom

      // More info https://github.com/hakimel/reveal.js#dependencies
      dependencies: [
        { src: 'plugin/markdown/marked.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
        { src: 'plugin/markdown/markdown.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
        { src: 'plugin/highlight/highlight.js' },
        { src: 'plugin/search/search.js', async: true },
        { src: 'plugin/zoom-js/zoom.js', async: true },
        { src: 'plugin/notes/notes.js', async: true }
      ]
    });
  }
}

const Theme = {
  init() {
    this.$$figures = $$('.theme figure')
    this.$transition = $('.theme .transition')
    this.$align = $('.theme .align')
    this.$reveal = $('.reveal')

    this.bind()
    this.loadTheme()
  },
  bind() {
    // 选中的样式
    this.$$figures.forEach($figure => $figure.onclick = () => {
      this.$$figures.forEach($item => $item.classList.remove('select'))
      $figure.classList.add('select')
      // 设置主题
      this.setTheme($figure.dataset.theme)
    })

    // 设置特效
    this.$transition.onchange = function () {
      localStorage.transition = this.value
      location.reload()
    }

    // 设置对齐风格
    this.$align.onchange = function () {
      localStorage.align = this.value
      location.reload()
    }
  },
  setTheme(theme) {
    localStorage.theme = theme
    location.reload()
  },
  loadTheme() {
    let theme = localStorage.theme || 'league'
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `css/theme/${theme}.css`
    document.head.appendChild($link)

    // 给对应的图片加上select
    Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('select')
    // 给对应的特效加上选中
    this.$transition.value = localStorage.transition || 'slide'
    // 对齐风格
    this.$align.value = localStorage.align || 'center'
    this.$reveal.classList.add(this.$align.value)
  }
}

const Print = {
  init() {
    this.$download = $('.download')

    this.bind()
    this.start()
  },
  bind() {
    this.$download.addEventListener('click', () => {
      let $link = document.createElement('a')
      $link.setAttribute('target', '_blank')
      $link.setAttribute('href', location.href.replace(/#\/.*/, '?print-pdf'))
      $link.click()
    })
  },
  start() {
    // reveal.js自带打印的代码
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    if (window.location.search.match(/print-pdf/gi)) {
      link.href = 'css/print/pdf.css';
      window.print()
    } else {
      link.href = 'css/print/paper.css'
    }
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

const App = {
  init() {
    [...arguments].forEach(Module => Module.init())
  }
}

App.init(Menu, Editor, Theme, Print, ImgUploader)
