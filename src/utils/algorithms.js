/**
https://www.mongodb.com/docs/manual/reference/method/cursor.skip/#pagination-example
Tinh toan gia tri skip phuc vu cho tac vu phan phan trang
 */

export const pagingSkipValue = (page, itemsPerPage) => {
  // Luon dam bao gia tri khong hop le thi return ve 0
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  /**
   * Vi du TH moi page hien thi 12 trang san pham(itemsPerPage - 12)
   * Case 01: dung de page 1 (page = 1) thi se lay 1 - 1 = 0 sau do nhan voi 12 thi cung bang 0, luc nay gia tri
   * skip la 0 nghia la khong skip ban ghi
   * Case 02: User dung de page 2 (page = 2) thi se lay 2 - 1 = 1 sau do nhan voi 12 thi se bang 12, luc nay gia tri
   * skip la 12 nghia la se bo qua 12 ban ghi dau tien
   * ...
   * Case 03: User dang dung o page 5 (page = 5) thi se lay 5 - 1 = 4 sau do nhan voi 12 thi se bang 48, luc nay gia tri
   * skip la 48 nghia la se bo qua 48 ban ghi cua 4 page truoc do
   */
  return (page - 1) * itemsPerPage
}
