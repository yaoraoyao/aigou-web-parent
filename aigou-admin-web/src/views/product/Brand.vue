<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="姓名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getbrands">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="brands" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;text-align: center">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="品牌名称" width="120" style="text-align: center" sortable>
            </el-table-column>
            <el-table-column prop="englishName" label="英文名称" width="150" sortable>
            </el-table-column>
            <el-table-column prop="firstLetter" label="首字母" width="120" sortable>
            </el-table-column>
            <el-table-column prop="logo" label="品牌logo" width="150" sortable>
                <template scope="scope">
                    <img :src="'http://172.16.4.207'+scope.row.logo"  height="50px"/>
                </template>
            </el-table-column>
            <el-table-column prop="productType.name" label="商品类型" width="180" sortable>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="150" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="品牌名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="英文名称" prop="englishName">
                    <el-input v-model="editForm.englishName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品类型" prop="productType.name">
                    <el-cascader
                            v-model="selectedType2"
                            :change-on-select="true"
                            :options="producttypes"
                            :show-all-levels="false"
                            :props="defaultParams"
                            @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="品牌logo" prop="name">
                    <el-input v-model="editForm.logo" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="editForm.description"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="品牌名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="英文名称" prop="englishName">
                    <el-input v-model="addForm.englishName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品类型" prop="productTypes">
                    <!--级联下拉框-->
                    <el-cascader
                            v-model="addForm.productTypes"
                            :change-on-select="true"
                            :options="producttypes"
                            :show-all-levels="false"
                            :props="defaultParams"
                            @change="handleChange"
                            ></el-cascader>
                </el-form-item>
                <el-form-item label="品牌logo" prop="logo">
                   <!-- <el-input v-model="addForm.logo" auto-complete="off"></el-input>-->
                    <el-upload
                            class="upload-demo"
                            action="http://127.0.0.1:9527/services/common/file"
                            list-type="picture"
                            :on-success="handleSuccess"
                            :before-upload="handleBeforeUpload"
                            :file-list="fileList"
                            >
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="addForm.description"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import util from '../../common/js/util'
    //import NProgress from 'nprogress'
    import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';
    export default {
        data() {
            return {
                //以上传的文件
                fileList:[],//用作回显
                //商品类型
                selectedType2:[],
                producttypes:[],//数据
                defaultParams: {
                    label: 'name',
                    value: 'id',
                    children: 'children'
                },
                filters: {
                    keyword: ''
                },
                brands: [],
                total: 0,
                page: 1,
                pageSize:10,
                listLoading: false,
                sels: [],//列表选中列
                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                editForm: {
                    name: '',
                    englishName: '',
                    productType: {
                        name:'',
                        id:''
                    },
                    description: '',
                    logo: ''
                },
                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        { required: true, message: '请输入品牌名称', trigger: 'blur' }
                    ],
                    englishName: [
                        { required: true, message: '请输入英文名称', trigger: 'blur' }
                    ],
                    productTypes: [
                        { type: 'array',required: true, message: '请选择商品类型', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                addForm: {
                    name: '',
                    englishName: '',
                    productType: {
                        name:'',
                        id:''
                    },
                    description: '',
                    logo: '',
                    productTypes:[]
                }
            }
        },
        methods: {
            //文件上传之前
            handleBeforeUpload(file){
                //看fileList中的元素个数
                //console.log("this.fileList",this.fileList);
                if(this.fileList.length>0){
                    this.$message({
                        message: '只能上传一张logo图片',
                        type: 'warning'
                    });
                    return false;//停止上传
                }

            },
            //文件上传成功后的钩子函数
            handleSuccess(response, file, fileList){
                let {success,message,restObj} = response;
                if(success){
                    this.addForm.logo = restObj;
                    this.$message({
                        message: '上传成功',
                        type: 'success'
                    });
                }else{
                    this.$message({
                        message: message,
                        type: 'error'
                    });
                }
                this.fileList = fileList;
            },
            //级联下拉框
            handleChange(value) {
                this.addForm.productType.id=value[value.length-1];
                this.editForm.productType.id=value[value.length-1];
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getbrands();
            },
            //获取品牌列表
            getbrands() {
                let para = {
                    page: this.page,
                    rows:this.pageSize,
                    keyword: this.filters.keyword
                };
                this.listLoading = true;
                this.$http.post("/product/brand/json",para)
                    .then(res=>{
                        this.listLoading = false;
                        console.debug(res);
                        let {total,rows}=res.data;
                        this.brands=rows;
                        this.total=total;
                    })
            },
            //删除一条
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    this.$http.delete("/product/brand/delete/"+row.id)
                        .then(res=>{
                            this.listLoading = false;
                            let {success,message,resultObject}=res.data;
                            if (success){
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                this.getbrands();
                            }else {
                                this.$message({
                                    message: 'message',
                                    type: 'error'
                                });
                            }
                        });
                }).catch(() => {
                });
            },
            changeDetSelect(key,treeData){
                let arr = []; // 在递归时操作的数组
                let returnArr = []; // 存放结果的数组
                let depth = 0; // 定义全局层级
                // 定义递归函数
                function childrenEach(childrenData, depthN) {
                    for (let j = 0; j < childrenData.length; j++) {
                        depth = depthN; // 将执行的层级赋值 到 全局层级
                        arr[depthN] = (childrenData[j].id);
                        if (childrenData[j].id === key) {
                            returnArr = arr.slice(0, depthN+1); //将目前匹配的数组，截断并保存到结果数组，
                            break
                        } else {
                            if (childrenData[j].children) {
                                console.debug("===");
                                depth ++;
                                childrenEach(childrenData[j].children, depth);
                            }
                        }
                    }
                    return returnArr;
                }
                return childrenEach(treeData, depth);
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.loadTypeTree();
                this.editForm = Object.assign({}, row);
                this.editForm.productType=row.productType;
                this.selectedType2=this.changeDetSelect(row.productType.id,this.producttypes);
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.loadTypeTree();
                this.addForm = {
                    name: '',
                    englishName: '',
                    productType: {
                        name:"",
                        id:""
                    },
                    description: '',
                    logo: ''
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            console.debug(para);
                            this.$http.post("/product/brand/add",para)
                                .then(res=>{
                                    this.addLoading = false;
                                    let {success,message}=res.data;
                                    //NProgress.done();
                                    if (success){
                                        this.$message({
                                            message: 'message',
                                            type: 'success'
                                        });
                                        this.$refs['editForm'].resetFields();
                                        this.editFormVisible = false;
                                        this.getbrands();
                                    }else {
                                        this.$message({
                                            message: 'message',
                                            type: 'error'
                                        });
                                    }
                                })
                        });
                    }
                });
            },
            //新增品牌
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            this.$http.post("/product/brand/add",para)
                                .then(res=>{
                                    this.addLoading = false;
                                    let {success,message}=res.data;
                                    //NProgress.done();
                                    if (success){
                                        this.$message({
                                            message: message,
                                            type: 'success'
                                        });
                                        this.$refs['addForm'].resetFields();
                                        this.addFormVisible = false;
                                        this.getbrands();
                                    }else {
                                        this.$message({
                                            message: message,
                                            type: 'error'
                                        });
                                    }
                                })
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.delete("/product/brand/deleteBatch?ids="+ids)
                        .then(res=>{
                            this.listLoading = false;
                            let {success,message,resultObject}=res.data;
                            if (success){
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                this.getbrands();
                            }else {
                                this.$message({
                                    message: 'message',
                                    type: 'error'
                                });
                            }
                        })
                }).catch(() => {});
            },
            //下拉框加载商品类型
            loadTypeTree(){
                this.$http.get("/product/productType/loadTypeTree")
                    .then(res=>{
                        console.debug(res);
                        this.producttypes=this.getTreeData(res.data);
                    })
            },
            getTreeData(data){
                // 循环遍历json数据
                for(var i=0;i<data.length;i++){
                    if(data[i].children.length<1){
                        // children若为空数组，则将children设为undefined
                        data[i].children=undefined;
                    }else {
                        // children若不为空数组，则继续 递归调用 本方法
                        this.getTreeData(data[i].children);
                    }
                }
                return data;
            }
        },
        mounted() {
            this.getbrands();
            this.loadTypeTree();
        }
    }
</script>

<style>
    .el -popper .el-cascader- panel .el-cascader-menu . el-scrollbar_ wrap{
        display: none !important;
    }
</style>