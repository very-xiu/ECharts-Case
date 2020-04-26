/*
 * chrome认为浏览器的滚动条是body的，可以通过body.scrollTop来获取
 * 火狐等浏览器认为浏览器的滚动条是html的，
 * var st = document.body.scrollTop || document.documentElement.scrollTop;
 * var sl = document.body.scrollLeft || document.documentElement.scrollLeft;
 */

//尝试创建一个可以执行简单动画的函数
/*
 * 参数：
 * 	obj:要执行动画的对象
 * 	attr:要执行动画的样式，比如：left top width height
 * 	target:执行动画的目标位置
 * 	speed:移动的速度(正数向右移动，负数向左移动)
 *  callback:回调函数，这个函数将会在动画执行完毕以后执行
 */
function move(obj, attr, target, speed, callback) {
    //关闭上一个定时器
    clearInterval(obj.timer);
    //获取元素目前的位置
    var current = parseInt(getStyle(obj, attr));
    //判断速度的正负值
    //如果从0 向 800移动，则speed为正
    //如果从800向0移动，则speed为负
    if (current > target) {
        //此时速度应为负值
        speed = -speed;
    }
    //开启一个定时器，用来执行动画效果
    //向执行动画的对象中添加一个timer属性，用来保存它自己的定时器的标识
    obj.timer = setInterval(function () {
        //获取box1的原来的left值
        var oldValue = parseInt(getStyle(obj, attr));
        //在旧值的基础上增加
        var newValue = oldValue + speed;
        //判断newValue是否大于800
        //从800 向 0移动
        //向左移动时，需要判断newValue是否小于target
        //向右移动时，需要判断newValue是否大于target
        if ((speed < 0 && newValue < target) || (speed > 0 && newValue > target)) {
            newValue = target;
        }
        //将新值设置给box1
        obj.style[attr] = newValue + "px";
        //当元素移动到0px时，使其停止执行动画
        if (newValue == target) {
            //达到目标，关闭定时器
            clearInterval(obj.timer);
            //动画执行完毕，调用回调函数
            callback && callback();
        }
    }, 30);
}

/*
 * 定义一个函数，用来获取指定元素的当前的样式
 * 参数：
 * 		obj 要获取样式的元素
 * 		name 要获取的样式名
 */
function getStyle(obj, name) {
    if (window.getComputedStyle) {
        //正常浏览器的方式，具有getComputedStyle()方法
        return getComputedStyle(obj, null)[name];
    } else {
        //IE8的方式，没有getComputedStyle()方法
        return obj.currentStyle[name];
    }
}

//定义一个函数，用来向一个元素中添加指定的class属性值
/*
 * 参数:
 * 	obj 要添加class属性的元素
 *  cn 要添加的class值
 * 	
 */
function addClass(obj, cn) {
    //检查obj中是否含有cn
    if (!hasClass(obj, cn)) {
        obj.className += " " + cn;
    }
}

/*
 * 判断一个元素中是否含有指定的class属性值
 * 	如果有该class，则返回true，没有则返回false
 * 	
 */
function hasClass(obj, cn) {
    //判断obj中有没有cn class
    //创建一个正则表达式
    //var reg = /\bb2\b/;
    var reg = new RegExp("\\b" + cn + "\\b");
    return reg.test(obj.className);
}

/*
 * 删除一个元素中的指定的class属性
 */
function removeClass(obj, cn) {
    //创建一个正则表达式
    var reg = new RegExp("\\b" + cn + "\\b");
    //删除class
    obj.className = obj.className.replace(reg, "");
}

/*
 * toggleClass可以用来切换一个类
 * 	如果元素中具有该类，则删除
 * 	如果元素中没有该类，则添加
 */
function toggleClass(obj, cn) {
    //判断obj中是否含有cn
    if (hasClass(obj, cn)) {
        //有，则删除
        removeClass(obj, cn);
    } else {
        //没有，则添加
        addClass(obj, cn);
    }
}

/* 
	addEventListener和attachEvent(IE8)兼容性问题解决方法，false改为true就是捕获阶段触发，从外向内
*/
function bind(obj, eventStr, callback) {
    if (obj.addEventListener) {
        obj.addEventListener(eventStr, callback, false)
    } else {
        obj.attachEvent('on' + eventStr, function () {
            callback.call(obj);
        })
    }
}

/*
 * 提取一个专门用来设置拖拽的函数
 * 参数：开启拖拽的元素
 */
function drag(obj) {
    //当鼠标在被拖拽元素上按下时，开始拖拽  onmousedown
    obj.onmousedown = function (event) {
        //设置box1捕获所有鼠标按下的事件
        /*
         * setCapture()
         * 	- 只有IE支持，但是在火狐中调用时不会报错，
         * 		而如果使用chrome调用，会报错
         */
        /*if(box1.setCapture){
        	box1.setCapture();
        }*/
        obj.setCapture && obj.setCapture();
        event = event || window.event;
        //div的偏移量 鼠标.clentX - 元素.offsetLeft
        //div的偏移量 鼠标.clentY - 元素.offsetTop
        var ol = event.clientX - obj.offsetLeft;
        var ot = event.clientY - obj.offsetTop;
        //为document绑定一个onmousemove事件
        document.onmousemove = function (event) {
            event = event || window.event;
            //当鼠标移动时被拖拽元素跟随鼠标移动 onmousemove
            //获取鼠标的坐标
            var left = event.clientX - ol;
            var top = event.clientY - ot;
            //修改box1的位置
            obj.style.left = left + "px";
            obj.style.top = top + "px";
        };
        //为document绑定一个鼠标松开事件
        document.onmouseup = function () {
            //当鼠标松开时，被拖拽元素固定在当前位置	onmouseup
            //取消document的onmousemove事件
            document.onmousemove = null;
            //取消document的onmouseup事件
            document.onmouseup = null;
            //当鼠标松开时，取消对事件的捕获
            obj.releaseCapture && obj.releaseCapture();
        };
        /*
         * 当我们拖拽一个网页中的内容时，浏览器会默认去搜索引擎中搜索内容，
         * 	此时会导致拖拽功能的异常，这个是浏览器提供的默认行为，
         * 	如果不希望发生这个行为，则可以通过return false来取消默认行为
         * 
         * 但是这招对IE8不起作用
         */
        return false;
    };
}

//定义一个自动切换的定时器的标识
var timer;
//创建一个函数，用来开启自动切换图片
function autoChange() {
    //开启一个定时器，用来定时去切换图片
    timer = setInterval(function () {
        //使索引自增
        index++;
        //判断index的值
        index %= imgArr.length;
        //执行动画，切换图片
        move(imgList, "left", -520 * index, 20, function () {
            //修改导航按钮
            setA();
        });
    }, 3000);
}

//创建一个方法用来设置选中的a
function setA() {
    //判断当前索引是否是最后一张图片
    if (index >= imgArr.length - 1) {
        //则将index设置为0
        index = 0;
        //此时显示的最后一张图片，而最后一张图片和第一张是一摸一样
        //通过CSS将最后一张切换成第一张
        imgList.style.left = 0;
    }
    //遍历所有a，并将它们的背景颜色设置为红色
    for (var i = 0; i < allA.length; i++) {
        allA[i].style.backgroundColor = "";
    }
    //将选中的a设置为黑色
    allA[index].style.backgroundColor = "black";
};

// 获取定位元素到页面顶点的Top
function offsetTopAll(obj) {
    var top = obj.offsetTop;
    var po = obj.offsetParent;
    while (po != null) {
        top += po.offsetTop;
        po = po.offsetParent;
    }
    return top;
}

// 获取定位元素到页面顶点的Left
function offsetLeftAll(obj) {
    var left = obj.offsetLeft;
    var po = obj.offsetParent;
    while (po != null) {
        left += po.offsetLeft;
        po = po.offsetParent;
    }
    return left;
}

// 通过类名获取所有元素的函数,获取给定标签名下的指定类名的元素,tagName可传也可以不传
function gclass(classn, tagName) {//全局获取类
    var tags = document.all ? document.all : document.getElementsByTagName(tagName || '*');
    var arr = [];
    for (var i = 0; i < tags.length; i++) {
        var one=classn.split(' ');
        var two=tags[i].className.split(' ');
        //获取只有一个类名的元素
        if (isHasArray(one, two)) {
            arr.push(tags[i]);
        }
    };
    return arr;
}
// 判断一个数组中的所有元素是否在另外的一个数组中存在
function isHasArray(one, two) {
    if (two.length < one.length) {
        return false;
    }
    var flag = 0;
    for (let i = 0; i < one.length; i++) {
        for (let j = 0; j < two.length; j++) {
            if (one[i] == two[j]) {
                flag++;
                break;
            }
        }
    }
    return flag == one.length;
}

// 通过URL获取文件
function getUrlName(url) {
    var l = url.lastIndexOf('/') + 1;
    var filename = url.substring(l);
    return filename;
}

// 获取下一个兄弟节点
function cnext(element) {
    var node = element.nextSibling;
    while (node && node.nodeType != 1) {
        node = node.nextSibling;
    }
    return node;
}

// 获取上一个兄弟节点
function cprev(element) {
    var node = element.previousSibling;
    while (node && node.nodeType != 1) {
        node = node.previousSibling;
    }
    return node;
}

// 获取所有子节点
function childs(element) {
    var nodes = element.childNodes;
    var arr = new Array();
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType == 1) {
            arr[arr.length] = nodes[i];
        }
    }
    return arr;
}

// 获取第一个子节点
function cfrist(element) {
    var node = element.firstChild;
    while (node && node.nodeType != 1) {
        node = node.nextSibling;
    }
    return node;
}

// 获取最后一个子节点
function clast(element) {
    var node = element.lastChild;
    while (node && node.nodeType != 1) {
        node = node.previousSibling;
    }
    return node;
}

// 获取所有兄弟元素节点，除了自己
function siblingsAll(element,tagName){
    return prevAll(element,tagName).concat(nextAll(element,tagName));
}

// 获取当前节点后面所有的元素,第二个参数指定是什么元素标签
function nextAll(element,tagName){
    var r=[];
    for(var n=element.nextSibling;n;n=n.nextSibling){
        if(n.nodeType==1){
            if(typeof(tagName) !='undefined'){
                if(tagName.toUpperCase()==n.nodeName){
                    r.push(n);
                }
            }else{
                r.push(n);
            }
        }
    }
    return r;
}

// 获取当前节点前面所有的元素,第二个参数指定是什么元素标签
function prevAll(element,tagName){
    var r=[];
    for(var n=element.previousSibling;n;n=n.previousSibling){
        if(n.nodeType==1){
            if(typeof(tagName) !='undefined'){
                if(tagName.toUpperCase()==n.nodeName){
                    r.push(n);
                }
            }else{
                r.push(n);
            }
        }
    }
    return r;
}

// 深拷贝
function type(obj) {
    var toString = Object.prototype.toString
    var map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    }
    return map[toString.call(obj)]
}
function deepClone(data) {
    var t = type(data); var o; var i; var ni

    if (t === 'array') {
        o = []
    } else if (t === 'object') {
        o = {}
    } else {
        return data
    }

    if (t === 'array') {
        for (i = 0, ni = data.length; i < ni; i++) {
            o.push(deepClone(data[i]))
        }
        return o
    } else if (t === 'object') {
        for (i in data) {
            o[i] = deepClone(data[i])
        }
        return o
    }
}

// 封装字符串中出现最多的项,并得到对应的数量
function getNa(list) {
    var obj = {}, name = 0, time = 0
    for (var i in list) {
        obj[list[i]] = obj[list[i]] ? obj[list[i]] + 1 : 1
    }
    for (var i in obj) {
        if (name < obj[i]) {
            name = obj[i]
            time = i
        }
    }
    return `${time}出现的次数最多,出现了${name}次`
}

// 13位时间戳转日期
function getLocalTime(nS) {
    //return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
    var date = new Date(nS);
    var Y = date.getFullYear() + '年';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + '日';
    var h = date.getHours() + ':';
    var m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds()) + ' ';
    return Y + M + D + h + m + s;
}

// 截流防抖
function throttle(fn, wait) {
    let flag = false;
    return function () {
        if (flag) return;
        flag = true;
        fn.call(this, arguments);
        setTimeout(() => {
            flag = false;
        }, wait);
    }
}
function debounce(fn, wait) {
    let timer;
    return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            fn.call(this, arguments);
        }, wait);
    }
}