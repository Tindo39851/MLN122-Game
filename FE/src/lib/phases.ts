export type QuestionOption = { id: string; label: string };

export type PhaseQuestion = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  correct: string;
  explanation: string;
};

export type BossPhase = {
  phase: number;
  name: string;
  bossName: string;
  bossTitle: string;
  bossHp: number;
  color: string;
  accent: string;
  intro: string;
  questions: PhaseQuestion[];
};

const opt = (a: string, b: string, c: string, d: string): QuestionOption[] => [
  { id: "a", label: a },
  { id: "b", label: b },
  { id: "c", label: c },
  { id: "d", label: d },
];

export const PHASES: BossPhase[] = [
  {
    phase: 1,
    name: "Xưởng Dệt Ca Đêm",
    bossName: "QUẢN ĐỐC CA ĐÊM",
    bossTitle: "Kẻ nắm giữ đồng hồ bấm giờ · Tư bản & Hàng hóa sức lao động",
    bossHp: 6,
    color: "#3b7a57",
    accent: "#d8f06f",
    intro: "Hạ gục Quản Đốc bằng 6 đòn tri thức về Hàng hóa sức lao động, tư bản bất biến (c) và khả biến (v)!",
    questions: [
      {
        id: "p1q1",
        prompt: "Công thức chung của tư bản lưu thông trên thị trường là gì?",
        options: opt("H – T – H", "T – H – T'", "T – H – T", "H – T' – H'"),
        correct: "b",
        explanation: "Tư bản vận động theo công thức T – H – T', trong đó T' = T + Δt (giá trị thặng dư).",
      },
      {
        id: "p1q2",
        prompt: "Điều kiện để sức lao động trở thành hàng hóa là gì?",
        options: opt(
          "Người lao động có tư liệu sản xuất riêng",
          "Người lao động tự do thân thể và không có tư liệu sản xuất",
          "Nhà nước bắt buộc lao động",
          "Có trình độ đại học trở lên",
        ),
        correct: "b",
        explanation: "Cần 2 điều kiện: tự do về thân thể và không có đủ tư liệu sản xuất nên phải bán sức lao động.",
      },
      {
        id: "p1q3",
        prompt: "Giá trị của hàng hóa sức lao động được đo gián tiếp bằng gì?",
        options: opt(
          "Số giờ làm thêm của công nhân",
          "Giá trị các tư liệu sinh hoạt cần thiết để tái sản xuất sức lao động",
          "Lợi nhuận của nhà tư bản",
          "Giá cả máy móc trong xưởng",
        ),
        correct: "b",
        explanation: "Gồm tư liệu sinh hoạt cho công nhân, gia đình họ và chi phí đào tạo nghề.",
      },
      {
        id: "p1q4",
        prompt: "Đặc điểm đặc biệt của giá trị sử dụng hàng hóa sức lao động là gì?",
        options: opt(
          "Khi tiêu dùng nó tạo ra giá trị mới lớn hơn giá trị bản thân nó",
          "Không bao giờ bị hao mòn",
          "Giá trị giảm dần khi sử dụng",
          "Chỉ tạo ra đúng giá trị ngang tiền lương",
        ),
        correct: "a",
        explanation: "Sức lao động là nguồn gốc tạo ra giá trị mới (v + m) lớn hơn giá trị bản thân nó (v).",
      },
      {
        id: "p1q5",
        prompt: "Bộ phận tư bản tồn tại dưới hình thái tư liệu sản xuất (máy móc, nguyên liệu) gọi là gì?",
        options: opt("Tư bản khả biến (v)", "Tư bản bất biến (c)", "Tư bản lưu động", "Giá trị thặng dư (m)"),
        correct: "b",
        explanation: "Tư bản bất biến (c) bảo tồn và chuyển nguyên vẹn giá trị vào sản phẩm mới.",
      },
      {
        id: "p1q6",
        prompt: "Bộ phận tư bản dùng để mua sức lao động được ký hiệu là gì?",
        options: opt("c (tư bản bất biến)", "v (tư bản khả biến)", "m (giá trị thặng dư)", "p (lợi nhuận)"),
        correct: "b",
        explanation: "Tư bản khả biến (v) tăng lên về lượng trong quá trình sản xuất nhờ lao động sống.",
      },
      {
        id: "p1q7",
        prompt: "Phần thời gian công nhân tạo ra giá trị ngang bằng tiền công của mình gọi là?",
        options: opt(
          "Thời gian lao động cần thiết (t)",
          "Thời gian lao động thặng dư (t')",
          "Thời gian nghỉ giải lao",
          "Thời gian chu chuyển",
        ),
        correct: "a",
        explanation: "Thời gian lao động cần thiết tái tạo giá trị sức lao động (v).",
      },
      {
        id: "p1q8",
        prompt: "Giá trị của một hàng hóa sản xuất trong xưởng được tính theo công thức nào?",
        options: opt("G = c + v", "G = c + v + m", "G = v + m", "G = c + m"),
        correct: "b",
        explanation: "G = c (giá trị cũ chuyển sang) + (v + m) (giá trị mới do lao động sống tạo ra).",
      },
      {
        id: "p1q9",
        prompt: "Bản chất của tiền công trong chủ nghĩa tư bản là gì?",
        options: opt(
          "Giá cả của lao động",
          "Giá cả của hàng hóa sức lao động",
          "Tiền thưởng từ lợi nhuận",
          "Giá trị của toàn bộ ngày lao động",
        ),
        correct: "b",
        explanation: "Tiền công là giá cả của hàng hóa sức lao động nhưng dễ gây lầm tưởng là giá cả của lao động.",
      },
      {
        id: "p1q10",
        prompt: "Vai trò của tư bản bất biến (c) trong quá trình tạo ra giá trị thặng dư là gì?",
        options: opt(
          "Nguồn gốc trực tiếp tạo ra m",
          "Điều kiện cần thiết để quá trình tạo ra m diễn ra",
          "Không cần thiết trong sản xuất",
          "Tự sinh sôi thêm giá trị mới",
        ),
        correct: "b",
        explanation: "c là điều kiện vật chất cần thiết, còn v (sức lao động) mới là nguồn gốc duy nhất tạo ra m.",
      },
    ],
  },
  {
    phase: 2,
    name: "Dây Chuyền Tăng Tốc",
    bossName: "CỖ MÁY KÉO GIỜ",
    bossTitle: "Trùm bóc lột thời gian · Tuyệt đối & Tương đối",
    bossHp: 6,
    color: "#2b5b84",
    accent: "#7ce8ff",
    intro: "Cỗ Máy Kéo Giờ đang ép ca kíp! Trả lời đúng 6/10 câu về phương pháp sản xuất giá trị thặng dư để phá hủy nó!",
    questions: [
      {
        id: "p2q1",
        prompt: "Kéo dài ngày lao động từ 8 giờ lên 10 giờ (khi t cần thiết không đổi) tạo ra loại giá trị thặng dư nào?",
        options: opt(
          "Giá trị thặng dư tương đối",
          "Giá trị thặng dư tuyệt đối",
          "Giá trị thặng dư siêu ngạch",
          "Lợi nhuận độc quyền",
        ),
        correct: "b",
        explanation: "Kéo dài tuyệt đối ngày lao động vượt quá thời gian lao động cần thiết tạo ra m tuyệt đối.",
      },
      {
        id: "p2q2",
        prompt: "Rút ngắn thời gian lao động cần thiết nhờ tăng năng suất lao động xã hội tạo ra gì?",
        options: opt(
          "Giá trị thặng dư tuyệt đối",
          "Giá trị thặng dư tương đối",
          "Tư bản bất biến",
          "Tiền lương danh nghĩa",
        ),
        correct: "b",
        explanation: "Khi năng suất xã hội tăng, giá trị tư liệu sinh hoạt giảm → giá trị sức lao động giảm → t giảm, t' tăng.",
      },
      {
        id: "p2q3",
        prompt: "Giới hạn tối đa của ngày lao động phụ thuộc vào yếu tố nào?",
        options: opt(
          "Ý muốn chủ quan của nhà tư bản",
          "Giới hạn thể chất, tinh thần của công nhân và cuộc đấu tranh giai cấp",
          "Số lượng máy móc trong xưởng",
          "Giá nguyên vật liệu",
        ),
        correct: "b",
        explanation: "Công nhân cần thời gian ăn, ngủ, nghỉ ngơi nên ngày lao động nhỏ hơn 24 giờ.",
      },
      {
        id: "p2q4",
        prompt: "Tăng cường độ lao động (làm khẩn trương, nặng nhọc hơn trong cùng thời gian) về thực chất giống với?",
        options: opt(
          "Tăng năng suất lao động",
          "Kéo dài ngày lao động (sản xuất m tuyệt đối)",
          "Giảm giá trị hàng hóa",
          "Tích tụ tư bản",
        ),
        correct: "b",
        explanation: "Tăng cường độ lao động là tiêu hao nhiều sức lực hơn trong cùng thời gian, tương tự kéo dài ngày làm việc.",
      },
      {
        id: "p2q5",
        prompt: "Khi năng suất lao động tăng lên thì giá trị của một đơn vị sản phẩm sẽ thay đổi thế nào?",
        options: opt("Tăng lên", "Giảm xuống", "Không đổi", "Tăng gấp đôi"),
        correct: "b",
        explanation: "Năng suất tăng làm số lượng sản phẩm tăng trong cùng thời gian → lượng giá trị kết tinh trong 1 sản phẩm giảm.",
      },
      {
        id: "p2q6",
        prompt: "Để rút ngắn thời gian lao động cần thiết (t), năng suất lao động phải tăng ở khu vực nào?",
        options: opt(
          "Chỉ ngành sản xuất vũ khí, xa xỉ phẩm",
          "Các ngành sản xuất tư liệu sinh hoạt và tư liệu sản xuất tạo ra chúng",
          "Chỉ riêng một xưởng nhỏ lẻ",
          "Ngành ngân hàng tài chính",
        ),
        correct: "b",
        explanation: "Tư liệu sinh hoạt rẻ đi thì giá trị sức lao động mới giảm, từ đó t mới giảm trên phạm vi xã hội.",
      },
      {
        id: "p2q7",
        prompt: "Ở giai đoạn đầu của chủ nghĩa tư bản khi kỹ thuật còn thấp, phương pháp nào được dùng chủ yếu?",
        options: opt(
          "Sản xuất giá trị thặng dư tuyệt đối",
          "Sản xuất giá trị thặng dư tương đối",
          "Tự động hóa hoàn toàn",
          "Giảm giờ làm xuống 4 giờ/ngày",
        ),
        correct: "a",
        explanation: "Khi máy móc chưa phát triển, nhà tư bản chủ yếu kéo dài ngày làm việc và tăng cường độ lao động.",
      },
      {
        id: "p2q8",
        prompt: "Ngày lao động 8 giờ gồm 4h cần thiết và 4h thặng dư. Nếu năng suất xã hội tăng làm t giảm còn 2h thì t' là?",
        options: opt("2 giờ", "4 giờ", "6 giờ", "8 giờ"),
        correct: "c",
        explanation: "Ngày lao động vẫn 8 giờ, t giảm từ 4h xuống 2h thì t' tăng từ 4h lên 6h (8 - 2 = 6).",
      },
      {
        id: "p2q9",
        prompt: "Cuộc đấu tranh đòi ngày làm 8 giờ của giai cấp công nhân nhắm trực tiếp vào thủ đoạn nào?",
        options: opt(
          "Kéo dài ngày lao động vô hạn để thu m tuyệt đối",
          "Đầu tư máy móc mới",
          "Giảm giá bán hàng hóa",
          "Mở rộng thị trường xuất khẩu",
        ),
        correct: "a",
        explanation: "Giới hạn pháp lý ngày làm 8 giờ buộc tư bản phải chuyển trọng tâm sang cải tiến kỹ thuật (m tương đối).",
      },
      {
        id: "p2q10",
        prompt: "Điểm chung của phương pháp sản xuất giá trị thặng dư tuyệt đối và tương đối là gì?",
        options: opt(
          "Đều làm giảm tỷ suất giá trị thặng dư",
          "Đều làm tăng tỷ suất giá trị thặng dư (m')",
          "Đều rút ngắn ngày lao động",
          "Đều tăng tiền lương thực tế bằng m",
        ),
        correct: "b",
        explanation: "Cả hai phương pháp đều nhằm kéo dài thời gian lao động thặng dư (t') so với (t), làm tăng m'.",
      },
    ],
  },
  {
    phase: 3,
    name: "Lò Nung Công Nghệ",
    bossName: "LÒ NUNG SIÊU NGẠCH",
    bossTitle: "Lõi nhiệt hiệu suất cao · Siêu ngạch, Tỷ suất & Khối lượng m",
    bossHp: 6,
    color: "#9a4b26",
    accent: "#ffd166",
    intro: "Lò Nung Siêu Ngạch đang quá tải nhiệt! Giải 6/10 bài toán về m siêu ngạch, tỷ suất m' và khối lượng M để dập lò!",
    questions: [
      {
        id: "p3q1",
        prompt: "Xưởng áp dụng công nghệ mới làm giá trị cá biệt thấp hơn giá trị xã hội thì thu được gì?",
        options: opt(
          "Giá trị thặng dư tuyệt đối",
          "Giá trị thặng dư siêu ngạch",
          "Địa tô tuyệt đối",
          "Tiền công danh nghĩa",
        ),
        correct: "b",
        explanation: "Chênh lệch giữa giá trị xã hội và giá trị cá biệt thấp hơn tạo ra giá trị thặng dư siêu ngạch.",
      },
      {
        id: "p3q2",
        prompt: "Vì sao C.Mác gọi giá trị thặng dư siêu ngạch là hình thức biến tướng của giá trị thặng dư tương đối?",
        options: opt(
          "Vì cả hai đều dựa trên cơ sở tăng năng suất lao động",
          "Vì cả hai đều do kéo dài ngày làm việc",
          "Vì cả hai không dùng máy móc",
          "Vì cả hai làm giảm năng suất",
        ),
        correct: "a",
        explanation: "m siêu ngạch dựa trên tăng năng suất cá biệt; khi phổ biến toàn ngành sẽ thành m tương đối.",
      },
      {
        id: "p3q3",
        prompt: "Trong từng xí nghiệp cá biệt, giá trị thặng dư siêu ngạch có tính chất gì?",
        options: opt(
          "Vĩnh viễn không bao giờ mất",
          "Tạm thời (nhất thời), nhưng xét toàn xã hội lại thường xuyên tồn tại",
          "Bị nhà nước tịch thu ngay",
          "Chỉ xuất hiện trong nông nghiệp",
        ),
        correct: "b",
        explanation: "Khi các xưởng khác cũng áp dụng máy mới, giá trị xã hội giảm xuống và xí nghiệp đầu mất ưu thế cá biệt.",
      },
      {
        id: "p3q4",
        prompt: "Công thức tính tỷ suất giá trị thặng dư (m') là gì?",
        options: opt("m' = (m / c) × 100%", "m' = (m / v) × 100%", "m' = m / (c + v) × 100%", "m' = (v / m) × 100%"),
        correct: "b",
        explanation: "m' = (m / v) × 100% hoặc (t' / t) × 100%, phản ánh trình độ bóc lột sức lao động.",
      },
      {
        id: "p3q5",
        prompt: "Tỷ suất giá trị thặng dư (m') phản ánh điều gì?",
        options: opt(
          "Quy mô bóc lột",
          "Trình độ (mức độ) bóc lột của nhà tư bản đối với công nhân làm thuê",
          "Hiệu quả đầu tư máy móc",
          "Tốc độ chu chuyển tư bản",
        ),
        correct: "b",
        explanation: "m' cho biết trong giá trị mới tạo ra, nhà tư bản chiếm bao nhiêu phần so với phần trả cho công nhân.",
      },
      {
        id: "p3q6",
        prompt: "Công thức tính khối lượng giá trị thặng dư (M) là gì?",
        options: opt("M = m' × V", "M = m' / V", "M = c × v", "M = V / m'"),
        correct: "a",
        explanation: "M = m' × V (trong đó V là tổng tư bản khả biến hay tổng quỹ lương ứng trước).",
      },
      {
        id: "p3q7",
        prompt: "Nếu v = 200 USD và m = 400 USD thì tỷ suất giá trị thặng dư (m') bằng bao nhiêu?",
        options: opt("50%", "100%", "200%", "300%"),
        correct: "c",
        explanation: "m' = (400 / 200) × 100% = 200%.",
      },
      {
        id: "p3q8",
        prompt: "Ngày làm việc 8 giờ, m' = 100%. Hỏi thời gian lao động cần thiết (t) và thặng dư (t') là bao nhiêu?",
        options: opt("t = 2h, t' = 6h", "t = 4h, t' = 4h", "t = 6h, t' = 2h", "t = 5h, t' = 3h"),
        correct: "b",
        explanation: "m' = t'/t = 100% → t' = t, mà t + t' = 8h nên t = 4h và t' = 4h.",
      },
      {
        id: "p3q9",
        prompt: "Khối lượng giá trị thặng dư (M) phản ánh điều gì?",
        options: opt(
          "Trình độ bóc lột",
          "Quy mô giá trị thặng dư mà chủ sở hữu tư liệu sản xuất thu được",
          "Giá trị máy móc hao mòn",
          "Số giờ nghỉ phép của công nhân",
        ),
        correct: "b",
        explanation: "m' phản ánh trình độ bóc lột, còn M phản ánh quy mô bóc lột.",
      },
      {
        id: "p3q10",
        prompt: "Động lực trực tiếp và mạnh mẽ nhất thúc đẩy các nhà tư bản cải tiến kỹ thuật là gì?",
        options: opt(
          "Lòng từ thiện",
          "Theo đuổi giá trị thặng dư siêu ngạch",
          "Muốn công nhân nhàn rỗi hơn",
          "Giảm quy mô sản xuất",
        ),
        correct: "b",
        explanation: "Vì ai đi đầu cải tiến kỹ thuật sẽ thu được m siêu ngạch vượt trội so với đối thủ.",
      },
    ],
  },
  {
    phase: 4,
    name: "Pháo Đài Tích Lũy",
    bossName: "ĐẠI TƯ BẢN ĐỘC QUYỀN",
    bossTitle: "Trùm cuối Xưởng A · Tích lũy, Tích tụ & Tập trung tư bản",
    bossHp: 6,
    color: "#5b2b6c",
    accent: "#f4a261",
    intro: "Trận chiến cuối cùng! Đánh sập Đại Tư Bản Độc Quyền bằng 6/10 đòn chí mạng về Tích lũy tư bản để giải phóng xưởng máy!",
    questions: [
      {
        id: "p4q1",
        prompt: "Thực chất của tích lũy tư bản là gì?",
        options: opt(
          "Cất trữ tiền vàng vào két sắt",
          "Biến một phần giá trị thặng dư thành tư bản phụ thêm (tư bản hóa m)",
          "Tiêu dùng hết giá trị thặng dư cho cá nhân",
          "Bán bớt nhà xưởng",
        ),
        correct: "b",
        explanation: "Tích lũy tư bản là tư bản hóa giá trị thặng dư để phục vụ tái sản xuất mở rộng.",
      },
      {
        id: "p4q2",
        prompt: "Nguồn gốc duy nhất của tư bản tích lũy là gì?",
        options: opt(
          "Tài năng bẩm sinh của nhà tư bản",
          "Giá trị thặng dư do lao động của công nhân tạo ra",
          "Vay nợ nước ngoài",
          "May mắn trên thị trường chứng khoán",
        ),
        correct: "b",
        explanation: "Giá trị thặng dư (m) là nguồn gốc duy nhất của tư bản tích lũy.",
      },
      {
        id: "p4q3",
        prompt: "Khi tỷ lệ phân chia giữa tích lũy và tiêu dùng đã xác định, nhân tố nào làm tăng quy mô tích lũy?",
        options: opt(
          "Giảm năng suất lao động",
          "Nâng cao tỷ suất giá trị thặng dư, năng suất lao động và quy mô tư bản ứng trước",
          "Đóng cửa bớt dây chuyền",
          "Tăng chi tiêu xa xỉ của chủ xưởng",
        ),
        correct: "b",
        explanation: "4 nhân tố: trình độ khai thác sức lao động, năng suất xã hội, chênh lệch tư bản sử dụng/tiêu dùng, và quy mô tư bản ứng trước.",
      },
      {
        id: "p4q4",
        prompt: "Sự tăng thêm quy mô của tư bản cá biệt bằng cách tư bản hóa giá trị thặng dư gọi là gì?",
        options: opt("Tập trung tư bản", "Tích tụ tư bản", "Chu chuyển tư bản", "Tuần hoàn tư bản"),
        correct: "b",
        explanation: "Tích tụ tư bản là kết quả trực tiếp của tích lũy tư bản, làm tăng cả tư bản cá biệt lẫn tư bản xã hội.",
      },
      {
        id: "p4q5",
        prompt: "Sự hợp nhất nhiều tư bản cá biệt nhỏ thành một tư bản cá biệt lớn hơn gọi là gì?",
        options: opt("Tích tụ tư bản", "Tập trung tư bản", "Tái sản xuất giản đơn", "Khấu hao tài sản cố định"),
        correct: "b",
        explanation: "Tập trung tư bản (sáp nhập, tín dụng) làm tăng quy mô tư bản cá biệt nhưng không làm tăng tổng tư bản xã hội.",
      },
      {
        id: "p4q6",
        prompt: "Điểm khác nhau cơ bản giữa tích tụ tư bản và tập trung tư bản là gì?",
        options: opt(
          "Tích tụ làm tăng tổng tư bản xã hội, còn tập trung chỉ phân phối lại tư bản sẵn có",
          "Tập trung làm tăng tổng tư bản xã hội, còn tích tụ thì không",
          "Cả hai đều không làm tăng tư bản cá biệt",
          "Không có điểm gì khác nhau",
        ),
        correct: "a",
        explanation: "Tích tụ có nguồn gốc từ m mới tạo ra; tập trung là sáp nhập các tư bản đã có trong xã hội.",
      },
      {
        id: "p4q7",
        prompt: "Cấu tạo hữu cơ của tư bản (ký hiệu c/v) là gì?",
        options: opt(
          "Tỷ lệ số lượng máy móc trên diện tích nhà xưởng",
          "Cấu tạo giá trị được quyết định bởi cấu tạo kỹ thuật và phản ánh sự biến đổi của cấu tạo kỹ thuật",
          "Tỷ lệ giữa lợi nhuận và tiền lương",
          "Tỷ lệ hàng tồn kho",
        ),
        correct: "b",
        explanation: "Khi khoa học kỹ thuật phát triển, cấu tạo hữu cơ của tư bản (c/v) có xu hướng ngày càng tăng.",
      },
      {
        id: "p4q8",
        prompt: "Khi tích lũy tư bản làm cấu tạo hữu cơ (c/v) tăng lên thì cầu tương đối về sức lao động sẽ thế nào?",
        options: opt(
          "Tăng nhanh hơn c",
          "Có xu hướng giảm tương đối, dẫn tới nguy cơ thất nghiệp",
          "Không thay đổi",
          "Tăng gấp đôi mỗi năm",
        ),
        correct: "b",
        explanation: "Bộ phận c (máy móc) tăng nhanh hơn bộ phận v (thuê công nhân), gây ra nạn nhân khẩu thừa tương đối.",
      },
      {
        id: "p4q9",
        prompt: "Tái sản xuất mở rộng tư bản chủ nghĩa là gì?",
        options: opt(
          "Sản xuất lặp lại với quy mô như cũ",
          "Sự lặp lại quá trình sản xuất với quy mô và trình độ lớn hơn trước nhờ tích lũy tư bản",
          "Thu hẹp quy mô sản xuất",
          "Ngừng sản xuất để bảo trì",
        ),
        correct: "b",
        explanation: "Muốn tái sản xuất mở rộng, nhà tư bản phải dùng một phần m để mua thêm c và v phụ thêm.",
      },
      {
        id: "p4q10",
        prompt: "Hai đòn bẩy mạnh nhất thúc đẩy quá trình tập trung tư bản là gì?",
        options: opt(
          "Cạnh tranh và tín dụng tư bản chủ nghĩa",
          "Khuyến mãi và quảng cáo",
          "Tăng giờ làm và giảm lương",
          "Nhập khẩu và xuất khẩu",
        ),
        correct: "a",
        explanation: "Cạnh tranh buộc các nhà tư bản liên kết/thâu tóm nhau, còn hệ thống tín dụng giúp huy động vốn lớn nhanh chóng.",
      },
    ],
  },
];

export const TOTAL_PHASES = PHASES.length;
export const QUESTIONS = PHASES; // Tương thích import cũ

export const SCORING = {
  base: 500,
  speedBonus: 500,
  streakBonus: 100,
  maxStreakBonus: 300,
  bossKillBonus: 1000,
} as const;
