//
// 
// 自动刷新 zhaopin.com 的简历。
//
// JavaScript 参考资料：https://www.jianshu.com/p/fa7283046b9c
//
var JianLi = (function($window) {
    var Win = $window;
    var reflush_btn;
    var reflush_disabled = false;
    var reflush_total_count = 0;
    var reflush_interval_tid = null;
    var const_info_page_url = "https://i.zhaopin.com/resume";
    var info_page_is_ready = false;

    //
    // Logger
    var logger = {
        info: function(msg) {
            Win.console.log("[INFO] - " + msg)
        },
        debug: function(msg){
            Win.console.log("[DEBUG] - " + msg)
        },
        warn: function(msg) {
            Win.console.log("[WARNING] - " + msg)
        },
        error: function(msg) {
            Win.console.log("[ERROR] - " + msg)
        }
    }

    var get_top_window = function(){
        var top_win = Win;
        var find_record = 0;
        var max_record = 20;
        while (top_win.parent != top_win && find_record++ <= max_record) {
            top_win = top_win.parent
        }
        if (find_record <= max_record) {
            return top_win
        }
        return false
    }
    var timeout = function(ms){
        return new Win.Promise((resolve, reject) => {
            Win.setTimeout(resolve, ms);
        });
    }
    async function wait_page_ready(ms,win){
        if (!info_page_is_ready){
            await timeout(ms)
            wait_page_ready()
            logger.info("wait for the page of info ready.")
        }
    }
    var redirect_to_info_page = function(){
        var win = get_top_window()
        if (win){
            cur_href = win.location.href;            
            if (cur_href === const_info_page_url) {
                info_page_is_ready = true
            }
            else{
                win.location.href = const_info_page_url
                logger.info("update win.location.href ok.")
                win.document.onreadystatechange = function(){
                    logger.info("document readyState:" + win.document.readyState)
                    if(win.document.readyState == "complete"){
                        logger.info("document complete")
                        info_page_is_ready = true
                    } 
                }
            }
        }
        wait_page_ready(10000,win)
        logger.info("the page of info has ready.")
        return true
    }
    var init = function(){
        var result = redirect_to_info_page()
        if (result){
            if (reflush_btn == undefined) {
                spanElements = document.getElementsByTagName("span")
                for (i = 0; i < spanElements.length; i++) {
                    if (spanElements[i].innerText == "刷新") {
                        reflush_btn = spanElements[i].parentElement;
                        logger.info("finded reflush button.")
                        break;
                    }
                }
            }
        }
        return (reflush_btn != undefined);
    }
    
    return {
        start: function(interval){
            var flag = init()
            if (!flag) {
                logger.error("initial failed.")
                return this
            }
            reflush_disabled = false
            if (reflush_interval_tid == null) {
                reflush_interval_tid = setInterval(function(){
                    if (!reflush_disabled){
                        reflush_btn.click()
                        reflush_total_count += 1;
                        logger.info("reflush succ. total count = " + reflush_total_count)
                    }
                },interval)
            }
            return this
        },
        pause: function(){
            reflush_disabled = true
            return this
        },
        stop: function(){
            this.pause()
            clearInterval(reflush_interval_tid)
            reflush_interval_tid = null
            return this
        },
        reset: function(){
            reflush_total_count = 0
            info_page_is_ready = false
            return this
        },
        display: function() {
            logger.info("total reflush count:" + reflush_total_count)
        }
    }
})(window)

// var app = JianLi.start(1000)