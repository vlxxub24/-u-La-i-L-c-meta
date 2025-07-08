export const DOUGLUO_REALMS: { level: number, name: string }[] = [
    { level: 1, name: 'Hồn Sĩ' },
    { level: 11, name: 'Hồn Sư' },
    { level: 21, name: 'Đại Hồn Sư' },
    { level: 31, name: 'Hồn Tôn' },
    { level: 41, name: 'Hồn Tông' },
    { level: 51, name: 'Hồn Vương' },
    { level: 61, name: 'Hồn Đế' },
    { level: 71, name: 'Hồn Thánh' },
    { level: 81, name: 'Hồn Đấu La' },
    { level: 91, name: 'Phong Hào Đấu La' },
    { level: 95, name: 'Siêu Cấp Đấu La' },
    { level: 99, name: 'Cực Hạn Đấu La' },
    { level: 100, name: 'Bán Thần' },
    { level: 110, name: 'Thần' },
];

export const getRealmFromLevel = (level: number): { name: string; level: number } => {
    let currentRealm = { name: 'Phàm Nhân', level: 0 };
    for (const realm of DOUGLUO_REALMS) {
        if (level >= realm.level) {
            currentRealm = { name: realm.name, level: level };
        } else {
            break;
        }
    }
    return currentRealm;
};

export const DEFAULT_REALM_SYSTEM_STRING = DOUGLUO_REALMS.map(r => `${r.name} (Cấp ${r.level}+)`).join('\n');

export const DOUGLUO_WORLD_DESCRIPTION = "Đây là một thế giới không có ma pháp, không có đấu khí, cũng không có võ thuật, chỉ có thứ duy nhất là Võ Hồn. Mỗi người khi đến 6 tuổi sẽ thức tỉnh Võ Hồn của riêng mình. Võ Hồn có thể là công cụ, thực vật, hoặc động vật. Sức mạnh của Hồn Sư phụ thuộc vào việc họ săn giết Hồn Thú để hấp thu Hồn Hoàn, từ đó nhận được kỹ năng và tăng cường sức mạnh, bước đi trên con đường cường giả vô tận.";

export const DOUGLUO_EVENTS: { time: string; title: string; description: string }[] = [
    {
        time: "Khởi đầu",
        title: "Thức Tỉnh Võ Hồn",
        description: "Tại Thánh Hồn Thôn, một cậu bé tên Đường Tam đã thức tỉnh song sinh Võ Hồn Lam Ngân Thảo và Hạo Thiên Chùy, mở đầu cho một huyền thoại."
    },
    {
        time: "Gia nhập Sử Lai Khắc",
        title: "Sử Lai Khắc Thất Quái",
        description: "Bảy thiếu niên thiên tài với những Võ Hồn kỳ lạ đã tập hợp tại Học viện Sử Lai Khắc, tạo thành một tổ đội không gì có thể ngăn cản."
    },
    {
        time: "Giải Đấu Hồn Sư Cao Cấp",
        title: "Vang Danh Toàn Lục",
        description: "Sử Lai Khắc Thất Quái đã vượt qua mọi đối thủ, bao gồm cả đội Hoàng Kim của Võ Hồn Điện, và giành chức vô địch, khẳng định vị thế của mình."
    },
    {
        time: "Tiểu Vũ Hiến Tế",
        title: "Bi Kịch Tinh Đấu Đại Sâm Lâm",
        description: "Bị Võ Hồn Điện truy sát, Tiểu Vũ đã lựa chọn hiến tế bản thân để cứu sống Đường Tam, một trong những khoảnh khắc bi thương nhất."
    },
    {
        time: "Thành lập Đường Môn",
        title: "Đường Môn Tái Xuất",
        description: "Đường Tam thành lập Đường Môn trên Đấu La Đại Lục, kết hợp ám khí và Hồn Sư, tạo ra một thế lực hoàn toàn mới."
    },
     {
        time: "Hải Thần Cửu Khảo",
        title: "Thử Thách Thần Cấp",
        description: "Đường Tam và các bạn đặt chân đến Hải Thần Đảo, bắt đầu chuỗi thử thách khắc nghiệt để có được sự thừa nhận của Hải Thần."
    },
    {
        time: "Đế Quốc Sụp Đổ",
        title: "Chiến Tranh Cuối Cùng",
        description: "Đường Tam, giờ đã là Hải Thần, dẫn dắt các Hồn Sư chống lại Võ Hồn Đế Quốc do Bỉ Bỉ Đông và Thiên Nhận Tuyết lãnh đạo, trận chiến cuối cùng quyết định vận mệnh của cả đại lục."
    }
];
