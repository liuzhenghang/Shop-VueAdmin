function getGoodsTable() {
    let height=$("#home").height()*0.9;
    layui.use('table', function(){
        let table = layui.table;
        let form=layui.form;
        //第一个实例
        let tableIns=table.render({
            elem: '#goodsTable'
            ,id:'goodsTable'
            ,height: height
            ,url: HOST+"/admin/goods/all" //数据接口
            ,parseData:function (res) {
                debug_(res)
                if (res.code===0){
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:res.data.count,
                        data:res.data.data
                    }
                }else {
                    return {
                        code:res.code,
                        msg:res.msg,
                        count:0,
                        data:null
                    }
                }
            }
            ,page: true //开启分页
            ,loading: true
            ,toolbar:'default'
            ,headers:{token:app.token,id:app.userId,author:"admin"}
            ,cols: [[ //表头
                {field: 'chk',title: '多选',type:'checkbox',fixed: 'left'}
                ,{field: 'id', title: 'ID', sort: true, width:80}
                ,{field: 'name', title: '商品名'}
                ,{field: 'type', title: '分类', sort: true,templet:function (d) {
                        let type=d.type.split(";");
                        let tmp=[];
                        for (let i = 0; i < type.length; i++) {
                            if (type[i]!==""){tmp.push(type[i])}
                        }
                        function f(ty,elem) {
                            elem=elem%5;
                            switch (elem) {
                                case 0:return "<button class='layui-btn layui-btn-xs layui-btn-radius'>"+ty+"</button>"
                                case 1:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-normal'>"+ty+"</button>"
                                case 2:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-warm'>"+ty+"</button>"
                                case 3:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-danger'>"+ty+"</button>"
                                case 4:return "<button class='layui-btn layui-btn-xs layui-btn-radius layui-btn-primary'>"+ty+"</button>"
                            }
                        }
                        let str="";
                        for (let i = 0; i < tmp.length; i++) {
                            str+=f(tmp[i],i);
                        }
                        str="<div class='layui-btn-container'>"+str+"</div>";
                        return str;

                    },width:300}
                ,{field: 'price', title: '单价', sort: true,templet:"<div>{{d.price}}元</div>",width:120}
                ,{field: 'cost', title: '成本', sort: true,templet:"<div>{{d.cost}}元</div>",width:120}
                ,{field: 'stock', title: '库存', sort: true,edit:'text',width:120}
                ,{field: 'sell', title: '已售出', sort: true,width:120}
                ,{field: 'enable', title: '上架', sort: true, templet:"#goodsEnableSwitch",width:100}
                ,{field: 'time', title: '上架时间', sort: true}
                ,{fixed: 'right', title:'操作', toolbar: '#goodsRightTool', width:200}
            ]]
            ,text:{
                none:"暂无"
            }
        });
        //监听行工具事件
        table.on('tool(goodsTable)', function(obj){
            let data = obj.data;
            //console.log(obj)
            if(obj.event === 'del'){
                debug_(obj)
                layer.confirm('删除：'+obj.data.name+"ID:"+obj.data.id, function(index){
                    // obj.del();
                    post("/admin/goods/delete",{token:app.token,id:app.userId,author:"admin"},{id:""+obj.data.id},function (data) {
                        if (data.code===0){
                            obj.del();
                            layer.close(index);
                        }else {
                            LMessageError(data.msg,data.code);
                        }
                    })
                });

            } else if(obj.event === 'edit'){
                debug_(obj)
                //弹出即全屏
                let index = layer.open({
                    type: 2,
                    anim:1,
                    content: 'page/addGoods.html?id='+obj.data.id+'&token='+app.token+"&uid="+app.userId,
                    area: ['50%', '90%'],
                    maxmin: true,
                    end:function () {
                        tableIns.reload("goodsTable");
                    }
                });
            }else if(obj.event==='cat'){
                let index = layer.open({
                    type: 2,
                    anim:1,
                    content: 'page/catGoods.html?id='+obj.data.id,
                    area: ['50%', '90%'],
                    maxmin: true,
                });
            }
        });

        //头工具栏事件
        table.on('toolbar(goodsTable)', function(obj){
            console.log(obj)
            let checkStatus = table.checkStatus(obj.config.id);
            let data = checkStatus.data;
            switch(obj.event){
                case 'add':
                    let index = layer.open({
                        type: 2,
                        anim:1,
                        content: 'page/addGoods.html?id=0&token='+app.token+"&uid="+app.userId,
                        area: ['50%', '90%'],
                        maxmin: true,
                        end:function () {
                            tableIns.reload("goodsTable")
                        }
                    });
                    break;
                case 'update':
                    // layer.msg('选中了：'+ data.length + ' 个');
                    if (data.length===1){
                        layer.confirm('编辑：'+data[0].name+"ID:"+data[0].id, function(index){
                            layer.close(index);
                        });
                    }else {
                        layer.msg('选中了：'+ data.length + ' 个');
                    }
                    break;
                case 'delete':

                    let names="";
                    for (let i = 0; i < data.length; i++) {
                        names+=data[i].name+";";
                    }
                    let id="";
                    for (let i = 0; i < data.length; i++) {
                        id+=data[i].id+";";
                    }
                    layer.confirm('选中了：'+ data.length + ' 个:'+names, function(index){
                        post("/admin/goods/delete",{token:app.token,id:app.userId,author:"admin"},{id:id},function (data) {
                            if (data.code===0){
                                tableIns.reload("goodsTable")
                                layer.close(index);
                            }else {
                                LMessageError(data.msg,data.code);
                            }
                        })
                    });
                    break;
            }
        });

        form.on('switch(goodsEnableSwitch)', function(obj){
            post("admin/goods/fast/enable",{token:app.token,id:app.userId,author:"admin"},{id:this.value,enable:obj.elem.checked},function (data) {
                if (data.code===0){
                    if (obj.elem.checked){
                        layer.tips("已上架", obj.othis);
                    }else {
                        layer.tips("已下架", obj.othis);
                    }
                }else {
                    LMessageError(data.msg,data.code);
                    obj.elem.checked=!obj.elem.checked;
                }
            },"更改中")
            return false;
        });

        table.on('edit(goodsTable)', function(obj){
            let value = obj.value //得到修改后的值
                ,data = obj.data //得到所在行所有键值
                ,field = obj.field; //得到字段
            value=parseInt(obj.value);
            debug_(data)
            // layer.msg('[ID: '+ data.id +'] ' + field + ' 字段更改为：'+ value);
            post("admin/goods/fast/stock",{token:app.token,id:app.userId,author:"admin"},{id:data.id,stock:value},function (data) {
                if (data.code===0){
                    LMessageSuccess("库存调整成功")
                }else {
                    LMessageError(data.msg,data.code);
                }
            },"更改中")
            return false;
        });

    });
}
