const express = require("express");
const router = express.Router();

// Wing data (embedded from wing.json)
const wingData = [
    {"id":1400001,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.1","price":9999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400002,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.2","price":999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400003,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.3","price":12000,"currency":2,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400004,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.4","price":150,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400005,"typeId":14,"iconUrl":"","sex":1,"resourceId":"custom_wing.7","price":220,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400006,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.8","price":120,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400007,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.300302","price":14400,"currency":1,"quantity":0,"clanLevel":5,"isNew":1},
    {"id":1400008,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.300301","price":14400,"currency":1,"quantity":0,"clanLevel":5,"isNew":1},
    {"id":1400009,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.3004","price":18000,"currency":1,"quantity":0,"clanLevel":9,"isNew":1},
    {"id":1400010,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.3002","price":14400,"currency":1,"quantity":0,"clanLevel":4,"isNew":1},
    {"id":1400011,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.3001","price":12000,"currency":1,"quantity":0,"clanLevel":3,"isNew":1},
    {"id":1400012,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_tail.2","price":10000,"currency":2,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400013,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.10","price":5000,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400014,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.9","price":8000,"currency":2,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400015,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.14","price":999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400016,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.13","price":9999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400017,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.16","price":200,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400018,"typeId":14,"iconUrl":"","sex":2,"resourceId":"custom_wing.23","price":999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400019,"typeId":14,"iconUrl":"","sex":1,"resourceId":"custom_wing.21","price":9999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400020,"typeId":14,"iconUrl":"","sex":2,"resourceId":"custom_wing.21","price":9999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400021,"typeId":14,"iconUrl":"","sex":1,"resourceId":"custom_wing.23","price":999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400022,"typeId":14,"iconUrl":"","sex":0,"resourceId":"custom_wing.22","price":9999,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400023,"typeId":14,"iconUrl":"","sex":1,"resourceId":"custom_wing.28","price":230,"currency":1,"quantity":0,"clanLevel":0,"isNew":1},
    {"id":1400024,"typeId":14,"iconUrl":"","sex":2,"resourceId":"custom_wing.31","price":100,"currency":1,"quantity":0,"clanLevel":0,"isNew":1}
];

// Endpoint
router.get("/api/v1/shop/decorations/:typeId", (req, res) => {
    const typeId = parseInt(req.params.typeId, 10);
    const { currency, pageNo = 0, pageSize = 20 } = req.query;

    // Filter by typeId and optional currency
    let filtered = wingData.filter(item => item.typeId === typeId);
    if (currency !== undefined) {
        filtered = filtered.filter(item => item.currency === parseInt(currency, 10));
    }

    // Pagination
    const page = parseInt(pageNo, 10);
    const size = parseInt(pageSize, 10);
    const start = page * size;
    const end = start + size;
    const paged = filtered.slice(start, end);

    res.json({
        code: 1,
        message: "SUCCESS",
        data: {
            list: paged,
            total: filtered.length,
            pageNo: page,
            pageSize: size
        }
    });
});

module.exports = router;