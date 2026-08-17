const tombsData = [
    {
        id: "yongzhao",
        name: "永昭陵",
        emperor: "宋仁宗 (赵祯)",
        area: "市区陵区",
        era: "北宋 (1022年-1063年在位)",
        level: "全国重点文物保护单位",
        desc: "永昭陵是北宋第四代皇帝宋仁宗赵祯的陵寝。仁宗在位四十二年，是两宋时期在位时间最长的皇帝，期间名臣辈出，史称“仁宗盛治”。永昭陵位于巩义市区，是目前宋陵中唯一进行过大规模地面复原的陵寝，建有宋陵公园，地面石刻雕像保存完好，尤其是瑞禽石雕极为精美，是北宋石刻艺术的代表作。",
        images: ["yongzhao_01.jpg", "yongzhao_02.jpg"],
        location: { mapX: 520, mapY: 350 }, // Coordinates for SVG map
        amap: "https://uri.amap.com/search?keyword=永昭陵&city=巩义"
    },
    {
        id: "yonghou",
        name: "永厚陵",
        emperor: "宋英宗 (赵曙)",
        area: "市区陵区",
        era: "北宋 (1063年-1067年在位)",
        level: "全国重点文物保护单位",
        desc: "永厚陵是宋英宗赵曙的陵寝。英宗是仁宗养子，在位仅四年。永厚陵紧邻永昭陵，位于其西北方。由于英宗在位时间短，陵寝规模较小，但在其后的岁月里，由于地处市区，曾遭破坏，现存部分石刻如石象、石虎等仍可见北宋风貌，其陵制与永昭陵基本一致。",
        images: ["yonghou_01.jpg", "yonghou_02.jpg"],
        location: { mapX: 490, mapY: 320 },
        amap: "https://uri.amap.com/search?keyword=永厚陵&city=巩义"
    },
    {
        id: "yongchang",
        name: "永昌陵",
        emperor: "宋太祖 (赵匡胤)",
        area: "西村陵区",
        era: "北宋 (960年-976年在位)",
        level: "全国重点文物保护单位",
        desc: "永昌陵是北宋开国皇帝宋太祖赵匡胤的陵寝。赵匡胤陈桥兵变建立宋朝。永昌陵的建制开创了宋代帝陵“坐北朝南”和特有神道石象生的规制。现存神门、阙台遗址及数十尊大型石雕，石雕风格古朴雄浑，具有五代向宋代过渡的显著艺术特征。",
        images: ["yongchang_01.jpg", "yongchang_02.jpg"],
        location: { mapX: 430, mapY: 530 },
        amap: "https://uri.amap.com/search?keyword=永昌陵&city=巩义"
    },
    {
        id: "yongxi",
        name: "永熙陵",
        emperor: "宋太宗 (赵光义)",
        area: "西村陵区",
        era: "北宋 (976年-997年在位)",
        level: "全国重点文物保护单位",
        desc: "永熙陵是北宋第二位皇帝宋太宗赵光义的陵寝。太宗期间完成了国家的基本统一。永熙陵神道两侧的石象生高大魁梧，雕刻精美，尤其是武将石雕，身披重甲，手握长剑，栩栩如生，被誉为宋陵石雕中的精品，反映了当时高超的雕刻工艺。",
        images: ["yongxi_01.jpg", "yongxi_02.jpg"],
        location: { mapX: 380, mapY: 560 },
        amap: "https://uri.amap.com/search?keyword=永熙陵&city=巩义"
    },
    {
        id: "yongding",
        name: "永定陵",
        emperor: "宋真宗 (赵恒)",
        area: "蔡庄陵区",
        era: "北宋 (997年-1022年在位)",
        level: "全国重点文物保护单位",
        desc: "永定陵是宋真宗赵恒的陵寝。真宗时期订立了“澶渊之盟”。永定陵位于蔡庄陵区，地势开阔。该陵的石刻中，客使石像雕刻了身穿异族服装的使臣形象，反映了北宋时期中外文化交流和周边民族关系的历史风貌。",
        images: ["yongding_01.jpg", "yongding_02.jpg"],
        location: { mapX: 515, mapY: 470 },
        amap: "https://uri.amap.com/search?keyword=永定陵&city=巩义"
    },
    {
        id: "yongyu",
        name: "永裕陵",
        emperor: "宋神宗 (赵顼)",
        area: "八陵陵区",
        era: "北宋 (1067年-1085年在位)",
        level: "全国重点文物保护单位",
        desc: "永裕陵是宋神宗赵顼的陵寝。神宗任用王安石推行“熙宁变法”，意图富国强兵。永裕陵位于八陵陵区，地势较高，神道极长。陵区内石刻造型写实，工艺细腻，呈现出北宋中后期雕刻艺术成熟完善的特点。",
        images: ["yongyu_01.jpg", "yongyu_02.jpg"],
        location: { mapX: 300, mapY: 650 },
        amap: "https://uri.amap.com/search?keyword=永裕陵&city=巩义"
    },
    {
        id: "yongtai",
        name: "永泰陵",
        emperor: "宋哲宗 (赵煦)",
        area: "八陵陵区",
        era: "北宋 (1085年-1100年在位)",
        level: "全国重点文物保护单位",
        desc: "永泰陵是北宋第七位皇帝宋哲宗赵煦的陵寝。哲宗在位期间曾一度恢复新法。永泰陵与永裕陵相距不远，是北宋晚期建成的帝陵。其石雕形体相对较小，刻工精细，但与太祖、太宗陵相比，气势略显收敛，折射出王朝后期的时代特征。",
        images: ["yongtai_01.jpg", "yongtai_02.jpg"],
        location: { mapX: 250, mapY: 670 },
        amap: "https://uri.amap.com/search?keyword=永泰陵&city=巩义"
    },
    {
        id: "yongan",
        name: "永安陵",
        emperor: "宋宣祖 (赵弘殷)",
        area: "西村陵区",
        era: "五代/北宋 (追尊)",
        level: "全国重点文物保护单位",
        desc: "永安陵是宋太祖赵匡胤之父赵弘殷的陵寝。赵弘殷生前未做皇帝，北宋建立后被追尊为宣祖。永安陵是宋陵中唯一一座先于宋朝建立的陵墓，其后在北宋时期进行了重修和扩建，使其符合帝陵规制，奠定了宋陵选址巩义的基础。",
        images: ["yongan_01.jpg", "yongan_02.jpg"],
        location: { mapX: 470, mapY: 570 },
        amap: "https://uri.amap.com/search?keyword=永安陵&city=巩义"
    }
];