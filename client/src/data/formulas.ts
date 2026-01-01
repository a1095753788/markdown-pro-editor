/**
 * 中小学常用公式库
 * 按科目和年级分类
 */

export interface Formula {
  id: string;
  name: string;
  latex: string;
  description: string;
  category: string;
  grade: 'junior' | 'senior' | 'both';
}

export const formulas: Formula[] = [
  // ==================== 数学 - 初中 ====================
  {
    id: 'math-junior-1',
    name: '完全平方公式',
    latex: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2',
    description: '两数和或差的平方',
    category: '代数',
    grade: 'junior',
  },
  {
    id: 'math-junior-2',
    name: '平方差公式',
    latex: 'a^2 - b^2 = (a+b)(a-b)',
    description: '平方差分解',
    category: '代数',
    grade: 'junior',
  },
  {
    id: 'math-junior-3',
    name: '一次函数',
    latex: 'y = kx + b',
    description: '一次函数标准形式',
    category: '函数',
    grade: 'junior',
  },
  {
    id: 'math-junior-4',
    name: '二次函数',
    latex: 'y = ax^2 + bx + c',
    description: '二次函数标准形式',
    category: '函数',
    grade: 'junior',
  },
  {
    id: 'math-junior-5',
    name: '二次函数顶点式',
    latex: 'y = a(x-h)^2 + k',
    description: '二次函数顶点形式',
    category: '函数',
    grade: 'junior',
  },
  {
    id: 'math-junior-6',
    name: '一元二次方程求根公式',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
    description: '求解一元二次方程',
    category: '方程',
    grade: 'junior',
  },
  {
    id: 'math-junior-7',
    name: '勾股定理',
    latex: 'a^2 + b^2 = c^2',
    description: '直角三角形三边关系',
    category: '几何',
    grade: 'junior',
  },
  {
    id: 'math-junior-8',
    name: '三角形面积',
    latex: 'S = \\frac{1}{2}ah',
    description: '三角形面积公式',
    category: '几何',
    grade: 'junior',
  },
  {
    id: 'math-junior-9',
    name: '圆的周长',
    latex: 'C = 2\\pi r',
    description: '圆的周长公式',
    category: '几何',
    grade: 'junior',
  },
  {
    id: 'math-junior-10',
    name: '圆的面积',
    latex: 'S = \\pi r^2',
    description: '圆的面积公式',
    category: '几何',
    grade: 'junior',
  },
  {
    id: 'math-junior-11',
    name: '正弦定理',
    latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
    description: '三角形正弦定理',
    category: '三角',
    grade: 'junior',
  },
  {
    id: 'math-junior-12',
    name: '余弦定理',
    latex: 'c^2 = a^2 + b^2 - 2ab\\cos C',
    description: '三角形余弦定理',
    category: '三角',
    grade: 'junior',
  },
  {
    id: 'math-junior-13',
    name: '等差数列通项公式',
    latex: 'a_n = a_1 + (n-1)d',
    description: '等差数列第n项',
    category: '数列',
    grade: 'junior',
  },
  {
    id: 'math-junior-14',
    name: '等比数列通项公式',
    latex: 'a_n = a_1 \\cdot q^{n-1}',
    description: '等比数列第n项',
    category: '数列',
    grade: 'junior',
  },

  // ==================== 数学 - 高中 ====================
  {
    id: 'math-senior-1',
    name: '二项式定理',
    latex: '(a+b)^n = \\sum_{k=0}^{n} C_n^k a^{n-k}b^k',
    description: '二项式展开',
    category: '代数',
    grade: 'senior',
  },
  {
    id: 'math-senior-2',
    name: '组合数公式',
    latex: 'C_n^k = \\frac{n!}{k!(n-k)!}',
    description: '组合数计算',
    category: '组合',
    grade: 'senior',
  },
  {
    id: 'math-senior-3',
    name: '排列数公式',
    latex: 'A_n^k = \\frac{n!}{(n-k)!}',
    description: '排列数计算',
    category: '组合',
    grade: 'senior',
  },
  {
    id: 'math-senior-4',
    name: '导数定义',
    latex: 'f\'(x) = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x)-f(x)}{\\Delta x}',
    description: '导数的定义',
    category: '微积分',
    grade: 'senior',
  },
  {
    id: 'math-senior-5',
    name: '幂函数导数',
    latex: '(x^n)\' = nx^{n-1}',
    description: '幂函数求导',
    category: '微积分',
    grade: 'senior',
  },
  {
    id: 'math-senior-6',
    name: '指数函数导数',
    latex: '(e^x)\' = e^x',
    description: '指数函数求导',
    category: '微积分',
    grade: 'senior',
  },
  {
    id: 'math-senior-7',
    name: '对数函数导数',
    latex: '(\\ln x)\' = \\frac{1}{x}',
    description: '对数函数求导',
    category: '微积分',
    grade: 'senior',
  },
  {
    id: 'math-senior-8',
    name: '三角函数导数-正弦',
    latex: '(\\sin x)\' = \\cos x',
    description: '正弦函数求导',
    category: '微积分',
    grade: 'senior',
  },
  {
    id: 'math-senior-9',
    name: '三角函数导数-余弦',
    latex: '(\\cos x)\' = -\\sin x',
    description: '余弦函数求导',
    category: '微积分',
    grade: 'senior',
  },
  {
    id: 'math-senior-10',
    name: '定积分',
    latex: '\\int_a^b f(x)dx = F(b) - F(a)',
    description: '定积分计算',
    category: '微积分',
    grade: 'senior',
  },
  {
    id: 'math-senior-11',
    name: '椭圆方程',
    latex: '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1',
    description: '椭圆标准方程',
    category: '解析几何',
    grade: 'senior',
  },
  {
    id: 'math-senior-12',
    name: '双曲线方程',
    latex: '\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1',
    description: '双曲线标准方程',
    category: '解析几何',
    grade: 'senior',
  },
  {
    id: 'math-senior-13',
    name: '抛物线方程',
    latex: 'y^2 = 2px',
    description: '抛物线标准方程',
    category: '解析几何',
    grade: 'senior',
  },
  {
    id: 'math-senior-14',
    name: '向量数量积',
    latex: '\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta',
    description: '向量数量积公式',
    category: '向量',
    grade: 'senior',
  },
  {
    id: 'math-senior-15',
    name: '向量夹角',
    latex: '\\cos\\theta = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}||\\vec{b}|}',
    description: '向量夹角计算',
    category: '向量',
    grade: 'senior',
  },

  // ==================== 物理 - 初中 ====================
  {
    id: 'physics-junior-1',
    name: '速度',
    latex: 'v = \\frac{s}{t}',
    description: '速度计算',
    category: '运动',
    grade: 'junior',
  },
  {
    id: 'physics-junior-2',
    name: '密度',
    latex: '\\rho = \\frac{m}{V}',
    description: '密度计算',
    category: '物质',
    grade: 'junior',
  },
  {
    id: 'physics-junior-3',
    name: '力',
    latex: 'F = ma',
    description: '牛顿第二定律',
    category: '力学',
    grade: 'junior',
  },
  {
    id: 'physics-junior-4',
    name: '压强',
    latex: 'P = \\frac{F}{S}',
    description: '压强计算',
    category: '力学',
    grade: 'junior',
  },
  {
    id: 'physics-junior-5',
    name: '功',
    latex: 'W = Fs',
    description: '功的计算',
    category: '功能',
    grade: 'junior',
  },
  {
    id: 'physics-junior-6',
    name: '功率',
    latex: 'P = \\frac{W}{t}',
    description: '功率计算',
    category: '功能',
    grade: 'junior',
  },
  {
    id: 'physics-junior-7',
    name: '动能',
    latex: 'E_k = \\frac{1}{2}mv^2',
    description: '动能计算',
    category: '能量',
    grade: 'junior',
  },
  {
    id: 'physics-junior-8',
    name: '重力势能',
    latex: 'E_p = mgh',
    description: '重力势能计算',
    category: '能量',
    grade: 'junior',
  },
  {
    id: 'physics-junior-9',
    name: '电流',
    latex: 'I = \\frac{Q}{t}',
    description: '电流计算',
    category: '电学',
    grade: 'junior',
  },
  {
    id: 'physics-junior-10',
    name: '电压',
    latex: 'U = \\frac{W}{Q}',
    description: '电压计算',
    category: '电学',
    grade: 'junior',
  },
  {
    id: 'physics-junior-11',
    name: '电阻',
    latex: 'R = \\frac{U}{I}',
    description: '欧姆定律',
    category: '电学',
    grade: 'junior',
  },
  {
    id: 'physics-junior-12',
    name: '电功率',
    latex: 'P = UI',
    description: '电功率计算',
    category: '电学',
    grade: 'junior',
  },
  {
    id: 'physics-junior-13',
    name: '焦耳热',
    latex: 'Q = I^2Rt',
    description: '焦耳热计算',
    category: '电学',
    grade: 'junior',
  },

  // ==================== 物理 - 高中 ====================
  {
    id: 'physics-senior-1',
    name: '匀加速直线运动',
    latex: 'v = v_0 + at',
    description: '速度公式',
    category: '运动',
    grade: 'senior',
  },
  {
    id: 'physics-senior-2',
    name: '匀加速位移',
    latex: 's = v_0t + \\frac{1}{2}at^2',
    description: '位移公式',
    category: '运动',
    grade: 'senior',
  },
  {
    id: 'physics-senior-3',
    name: '速度-位移关系',
    latex: 'v^2 - v_0^2 = 2as',
    description: '速度位移关系',
    category: '运动',
    grade: 'senior',
  },
  {
    id: 'physics-senior-4',
    name: '万有引力',
    latex: 'F = G\\frac{m_1m_2}{r^2}',
    description: '万有引力公式',
    category: '万有引力',
    grade: 'senior',
  },
  {
    id: 'physics-senior-5',
    name: '向心加速度',
    latex: 'a = \\frac{v^2}{r} = \\omega^2 r',
    description: '向心加速度',
    category: '圆周运动',
    grade: 'senior',
  },
  {
    id: 'physics-senior-6',
    name: '向心力',
    latex: 'F = m\\frac{v^2}{r}',
    description: '向心力公式',
    category: '圆周运动',
    grade: 'senior',
  },
  {
    id: 'physics-senior-7',
    name: '动量',
    latex: 'p = mv',
    description: '动量计算',
    category: '动量',
    grade: 'senior',
  },
  {
    id: 'physics-senior-8',
    name: '冲量',
    latex: 'I = Ft = \\Delta p',
    description: '冲量计算',
    category: '动量',
    grade: 'senior',
  },
  {
    id: 'physics-senior-9',
    name: '机械能守恒',
    latex: 'E_k + E_p = \\text{constant}',
    description: '机械能守恒定律',
    category: '能量',
    grade: 'senior',
  },
  {
    id: 'physics-senior-10',
    name: '电场强度',
    latex: 'E = \\frac{F}{q}',
    description: '电场强度',
    category: '电学',
    grade: 'senior',
  },
  {
    id: 'physics-senior-11',
    name: '电势差',
    latex: 'U = \\frac{W}{q}',
    description: '电势差定义',
    category: '电学',
    grade: 'senior',
  },
  {
    id: 'physics-senior-12',
    name: '电容',
    latex: 'C = \\frac{Q}{U}',
    description: '电容计算',
    category: '电学',
    grade: 'senior',
  },

  // ==================== 化学 - 初中 ====================
  {
    id: 'chemistry-junior-1',
    name: '相对原子质量',
    latex: 'A_r = \\frac{m}{u}',
    description: '相对原子质量',
    category: '基础',
    grade: 'junior',
  },
  {
    id: 'chemistry-junior-2',
    name: '相对分子质量',
    latex: 'M_r = \\sum A_r',
    description: '相对分子质量',
    category: '基础',
    grade: 'junior',
  },
  {
    id: 'chemistry-junior-3',
    name: '物质的量',
    latex: 'n = \\frac{m}{M}',
    description: '物质的量计算',
    category: '基础',
    grade: 'junior',
  },
  {
    id: 'chemistry-junior-4',
    name: '溶质质量分数',
    latex: 'w = \\frac{m_{\\text{溶质}}}{m_{\\text{溶液}}} \\times 100\\%',
    description: '溶质质量分数',
    category: '溶液',
    grade: 'junior',
  },
  {
    id: 'chemistry-junior-5',
    name: '物质的量浓度',
    latex: 'c = \\frac{n}{V}',
    description: '物质的量浓度',
    category: '溶液',
    grade: 'junior',
  },

  // ==================== 化学 - 高中 ====================
  {
    id: 'chemistry-senior-1',
    name: '阿伏伽德罗常数',
    latex: 'N_A = 6.02 \\times 10^{23} \\text{ mol}^{-1}',
    description: '阿伏伽德罗常数',
    category: '基础',
    grade: 'senior',
  },
  {
    id: 'chemistry-senior-2',
    name: '气体摩尔体积',
    latex: 'V_m = \\frac{V}{n}',
    description: '气体摩尔体积',
    category: '气体',
    grade: 'senior',
  },
  {
    id: 'chemistry-senior-3',
    name: '理想气体状态方程',
    latex: 'PV = nRT',
    description: '理想气体状态方程',
    category: '气体',
    grade: 'senior',
  },
  {
    id: 'chemistry-senior-4',
    name: '电离度',
    latex: '\\alpha = \\frac{c_{\\text{电离}}}{c_{\\text{初始}}} \\times 100\\%',
    description: '电离度计算',
    category: '溶液',
    grade: 'senior',
  },
  {
    id: 'chemistry-senior-5',
    name: '氧化还原反应',
    latex: '\\text{失电子数} = \\text{得电子数}',
    description: '氧化还原反应规律',
    category: '反应',
    grade: 'senior',
  },
];

export const formulaCategories = {
  math: {
    junior: ['代数', '函数', '方程', '几何', '三角', '数列'],
    senior: ['代数', '组合', '微积分', '解析几何', '向量'],
  },
  physics: {
    junior: ['运动', '物质', '力学', '功能', '能量', '电学'],
    senior: ['运动', '万有引力', '圆周运动', '动量', '能量', '电学'],
  },
  chemistry: {
    junior: ['基础', '溶液'],
    senior: ['基础', '气体', '溶液', '反应'],
  },
};

export function getFormulasBySubject(subject: string, grade: 'junior' | 'senior' | 'both') {
  return formulas.filter((f) => {
    if (grade === 'both') return f.category;
    return f.grade === grade || f.grade === 'both';
  });
}

export function searchFormulas(query: string): Formula[] {
  const lowerQuery = query.toLowerCase();
  return formulas.filter(
    (f) =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery) ||
      f.category.toLowerCase().includes(lowerQuery)
  );
}
