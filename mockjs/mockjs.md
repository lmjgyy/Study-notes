# mockjs
## 一、开始&安装
### 使用案例:
    var Mock = require('mockjs')
    var data = Mock.mock({
		// 属性 list 的值是一个数组，其中含有 1 到 10 个元素
		'list|1-10': [{
			// 属性 id 是一个自增数，起始值为 1，每次增 1
			'id|+1': 1
		}]
	})
	// 输出结果
	console.log(JSON.stringify(data, null, 4))
## 二、语法规范
### 1.数据模板定义规范 DTD
###### 数据模板中的每个属性由 3 部分构成：属性名、生成规则、属性值：  
* 属性名   name
* 生成规则 rule
* 属性值   value
* 'name|rule': value
### 2.要点：
* 属性名 和 生成规则 之间用竖线 | 分隔。
* 生成规则 是可选的。
* 生成规则 有 7 种格式：  
	* 'name|min-max': value  
	* 'name|count': value
	* 'name|min-max.dmin-dmax': value
	* 'name|min-max.dcount': value
	* 'name|count.dmin-dmax': value
	* 'name|count.dcount': value
	* 'name|+step': value
* 生成规则的含义需要依 属性值的类型才能确定。
* 属性值 中可以含有 @占位符。
* 属性值 还指定了最终值的初始值和类型。
### 3.生成规则的示例 [官网案例](http://mockjs.com/examples.html#Number)
##### 属性值是字符串 String 
* 'name|min-max': string----通过重复 string 生成一个字符串，重复次数大于等于 min，小于等于 max
```
    'name|min-max': string
    {name: "stringstringstringstringstringstringstring"}
```
* 'name|count': string----通过重复 string 生成一个字符串，重复次数等于 count

``` 
    'name|3': string
    {name: "stringstringstring}
```

##### 属性值是数字 Number
* 'name|+1': number----属性值自动加 1，初始值为 number

```
    "number|1-100": 100 // 生成1-100任意数
```
* 'name|min-max.dmin-dmax': number生成一个浮点数，整数部分大于等于 min、小于等于 max，小数部分保留 dmin 到 dmax 位 
*
```
    "number|1-100.1-10": 1 // 生成1至100小数点保留1-10位的浮点数
    { "number": 74.9566082457}
```
##### 属性值是布尔型 Boolean
* 'name|1': boolean----随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率同样是 1/2。

```
    "boolean|1": true
    {"boolean": false}
```
* 'name|min-max': value----随机生成一个布尔值，值为 value 的概率是 min / (min + max)，值为 !value 的概率是 max / (min + max)

```
    "boolean|1-2": true // 1/3概率为true
    {"boolean": false}
```
##### 属性值是对象 Object	
* 'name|count': object----从属性值 object 中随机选取 count 个属性

```
    "object|2": { // 生成2位             
		"310000": "上海市",
		"320000": "江苏省",
		"330000": "浙江省",
		"340000": "安徽省"
	  }
	 "object": {
		"320000": "江苏省",
		"330000": "浙江省"
	  }
```
* 'name|min-max': object----从属性值 object 中随机选取 min 到 max 个属性

```
    "object|2-4": { // 选取2-4位
		"110000": "北京市",
		"120000": "天津市",
		"130000": "河北省",
		"140000": "山西省"
	  }
	 "object": {
		"110000": "北京市",
		"120000": "天津市",
		"140000": "山西省"
	  }
```
##### 属性值是数组 Array
* 'name|1': array----从属性值 array 中随机选取 1 个元素，作为最终值
```
    "array|1": [
        "AMD",
        "CMD",
        "UMD"
      ]
    "array": "AMD"
```
* 'name|+1': array----从属性值 array 中顺序选取 1 个元素，作为最终值
```
    "array|1": [
        "AMD",
        "CMD",
        "UMD"
      ]
    "array": "AMD"  /  {array: "CMD"} / {array: "UMD"}
```
* 'name|min-max': array----通过重复属性值array生成一个新数组，重复次数大于等于 min，小于等于 max
```
    "array|1-10": [
        {
          "name|+1": [
            "Hello",
            "Mock.js",
            "!"
          ]
        }
      ]
    "array": [
        {
          "name": "Hello"
        },
        {
          "name": "Mock.js"
        },
        {
          "name": "!"
        },
        {
          "name": "Hello"
        },
        {
          "name": "Mock.js"
        },
        {
          "name": "!"
        }
      ]
```
* 'name|count': array----通过重复属性值 array 生成一个新数组，重复次数为 count
```
    "array|3": [
        "Hello",
        "Mock.js",
        "!"
      ]
    "array": [
        "Hello",
        "Mock.js",
        "!",
        "Hello",
        "Mock.js",
        "!",
        "Hello",
        "Mock.js",
        "!"
      ]
```
#####  属性值是函数 Function
* 'name': function----执行函数 function，取其返回值作为最终的属性值，函数的上下文为属性 'name' 所在的对象
```
    'foo': 'Syntax Demo',
      'name': function() {
        return this.foo
      }
    {
  "foo": "Syntax Demo",
  "name": "Syntax Demo"
}
```
##### 属性值是正则表达式 RegExp
* 'name': regexp----根据正则表达式 regexp 反向生成可以匹配它的字符串。用于生成自定义格式的字符串
```
    'regexp1': /[a-z][A-Z][0-9]/,
    'regexp2': /\w\W\s\S\d\D/,
    'regexp3': /\d{5,10}/
    {
        "regexp1": "pJ7",
        "regexp2": "F)\fp1G",
        "regexp3": "561659409"
    }
```
###### Absolute Path
```
    Mock.mock({
      "foo": "Hello",
      "nested": {
        "a": {
          "b": {
            "c": "Mock.js"
          }
        }
      },
      "absolutePath": "@/foo @/nested/a/b/c"
    })
    {
      "foo": "Hello",
      "nested": {
        "a": {
          "b": {
            "c": "Mock.js"
          }
        }
      },
      "absolutePath": "Hello Mock.js"
    }
```
###### Relative Path
```
    Mock.mock({
      "foo": "Hello",
      "nested": {
        "a": {
          "b": {
            "c": "Mock.js"
          }
        }
      },
      "relativePath": {
        "a": {
          "b": {
            "c": "@../../../foo @../../../nested/a/b/c"
          }
        }
      }
    })
```
### 4.数据占位符定义规范 DPD
* 占位符 只是在属性值字符串中占个位置，并不出现在最终的属性值中
* 占位符 的格式为：
    * @占位符
    * @占位符(参数 [, 参数])
* 注意：
  * 用 @ 来标识其后的字符串是 占位符。
  * 占位符 引用的是 Mock.Random 中的方法。
  * 通过 Mock.Random.extend() 来扩展自定义占位符。
  * 占位符 也可以引用 数据模板 中的属性。
  * 占位符 会优先引用 数据模板 中的属性。
  * 占位符 支持 相对路径 和 绝对路径。
```
    name: {
        first: '@FIRST',
        middle: '@FIRST',
        last: '@LAST',
        full: '@first @middle @last'
    }
    "name": {
        "first": "Charles",
        "middle": "Brenda",
        "last": "Lopez",
        "full": "Charles Brenda Lopez"
    }
```



