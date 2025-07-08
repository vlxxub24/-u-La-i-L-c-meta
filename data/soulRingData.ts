import { SoulRing, SoulRingColor, SoulRingType } from '../types';

const getSoulRingColor = (years: number): SoulRingColor => {
    if (years >= 1000000) return 'Bách Vạn Niên';
    if (years >= 100000) return 'Thập Vạn Niên';
    if (years >= 10000) return 'Vạn Niên';
    if (years >= 1000) return 'Thiên Niên';
    if (years >= 100) return 'Bách Niên';
    return 'Thập Niên';
}

export const SOUL_RING_DATA: SoulRing[] = [
    {
        id: 'mandala_snake',
        name: 'Mạn Đà La Xà Hồn Hoàn',
        years: 1300,
        color: getSoulRingColor(1300),
        ability: 'Kỹ năng Trói Buộc - Triệu hồi dây leo từ mặt đất để trói và giam cầm mục tiêu.',
        sourceBeast: 'Mạn Đà La Xà',
        type: 'Rừng',
        story: 'Mạn Đà La Xà là một loại hồn thú thực vật cực kỳ nguy hiểm trong rừng rậm, nổi tiếng với khả năng ngụy trang và tấn công bất ngờ. Hồn hoàn của nó cung cấp kỹ năng khống chế mạnh mẽ.'
    },
    {
        id: 'ghost_tiger',
        name: 'Ám Ma Tà Thần Hổ Hồn Hoàn',
        years: 60000,
        color: getSoulRingColor(60000),
        ability: 'Bạch Hổ Ma Thần Biến - Tăng cường toàn diện sức mạnh, tốc độ và khả năng phòng ngự trong một khoảng thời gian ngắn.',
        sourceBeast: 'Ám Ma Tà Thần Hổ',
        type: 'Rừng',
        story: 'Vua của muôn thú, Ám Ma Tà Thần Hổ là một hồn thú Vạn Niên cực kỳ hung dữ. Hồn hoàn của nó mang lại sự bùng nổ sức mạnh đáng kinh ngạc, đặc biệt phù hợp với các Võ Hồn hệ Cường công.'
    },
    {
        id: 'azure_bull_python',
        name: 'Thiên Thanh Ngưu Mãng Hồn Hoàn',
        years: 200000,
        color: getSoulRingColor(200000),
        ability: 'Thiên Thanh Trì Độn Thần Trảo - Triệu hồi một chiếc long trảo khổng lồ, bao trùm một vùng không gian, làm chậm và nghiền nát kẻ địch bên trong.',
        sourceBeast: 'Thiên Thanh Ngưu Mãng',
        type: 'Rừng',
        story: 'Một trong hai vị vua của Tinh Đấu Đại Sâm Lâm, Đại Minh. Sức mạnh của nó là tuyệt đối, và hồn hoàn này chứa đựng một phần nhỏ sức mạnh lĩnh vực của nó.'
    },
    {
        id: 'blue_silver_emperor',
        name: 'Lam Ngân Hoàng Hồn Hoàn',
        years: 100000,
        color: getSoulRingColor(100000),
        ability: 'Dã Hỏa Thiêu Bất Tận, Xuân Phong Xuy Hựu Sinh - Cung cấp khả năng hồi phục cực nhanh và có thể tái sinh từ một mảnh nhỏ còn lại sau khi chịu sát thương chí mạng.',
        sourceBeast: 'Lam Ngân Hoàng',
        type: 'Đặc Thù',
        story: 'Hoàng đế của tất cả các thực vật, Lam Ngân Hoàng sở hữu sinh mệnh lực mạnh mẽ nhất. Hồn hoàn này là sự lựa chọn tối thượng cho việc sinh tồn và hồi phục.'
    },
    {
        id: 'ten_year_beast',
        name: 'Bạch Nhãn Lang Hồn Hoàn',
        years: 10,
        color: getSoulRingColor(10),
        ability: 'Phong Nhận - Bắn ra một lưỡi đao gió nhỏ.',
        sourceBeast: 'Bạch Nhãn Lang',
        type: 'Rừng',
        story: 'Hồn thú Thập Niên phổ biến, yếu và dễ bị săn bắt. Thường là lựa chọn đầu tiên cho các Hồn Sư mới thức tỉnh.'
    },
    {
        id: 'hundred_year_beast',
        name: 'U Minh Linh Miêu Hồn Hoàn',
        years: 800,
        color: getSoulRingColor(800),
        ability: 'U Minh Đột Thứ - Tăng tốc độ đột ngột và cường hóa đòn tấn công tiếp theo.',
        sourceBeast: 'U Minh Linh Miêu',
        type: 'Rừng',
        story: 'Một hồn thú hệ Mẫn công, cực kỳ nhanh nhẹn và giỏi ẩn nấp. Hồn hoàn này rất phù hợp để tăng cường tốc độ và sự linh hoạt.'
    },
    {
        id: 'ice_silkworm',
        name: 'Thiên Mộng Băng Tằm Hồn Hoàn',
        years: 1000000,
        color: getSoulRingColor(1000000),
        ability: 'Tinh Thần Tham Trắc Dữ Cộng Hưởng - Chia sẻ toàn bộ tầm nhìn và cảm nhận tinh thần trong một phạm vi khổng lồ, đồng thời có thể tạo ra ảo ảnh.',
        sourceBeast: 'Thiên Mộng Băng Tằm',
        type: 'Côn Trùng',
        story: 'Hồn thú Bách Vạn Niên đầu tiên và duy nhất được ghi nhận. Nó không có khả năng tấn công trực tiếp nhưng sở hữu Tinh Thần Lực mạnh mẽ không gì sánh được, là một hồn hoàn phụ trợ trong mơ.'
    },
];