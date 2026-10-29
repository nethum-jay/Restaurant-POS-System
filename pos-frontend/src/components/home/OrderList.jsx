// import React from "react";
// import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
// import { FaCircle } from "react-icons/fa";
// import { getAvatarName} from "../../utils/index"

// const OrderList = (key, order) => {
//   return (
//     <div className="flex items-center gap-5 mb-3">
//       <button className="bg-[#f6b100] p-4 text-xl font-bold rounded-lg">
//         {getAvatarName(order.customerDetails.name)}
//       </button>
//       <div className="flex items-center justify-between w-[100%]">
//         <div className="flex flex-col items-start gap-1">
//           <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
//             {order.customerDetails.name}
//           </h1>
//           <p className="text-[#ababab] text-sm">{order.items.length} Items</p>
//         </div>
//         <div>
//           <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1">
//             Table <FaLongArrowAltRight /> {order.table.tableNo}
//           </h1>
//         </div>
//         <div className="flex flex-col items-end gap-2">
//           <p className="text-green-600">
//             <FaCheckDouble className="inline mr-2" />
//             Ready
//           </p>
//           <p className="text-[#ababab] text-sm">
//             <FaCircle className="inline mr-2 text-green-600" />
//             Ready to serve
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderList;

import React from "react";
import { FaCheckDouble, FaCircle, FaLongArrowAltRight } from "react-icons/fa";
import { getAvatarName } from "../../utils/index";

const OrderList = ({ order }) => {
  if (!order || !order.customerDetails) {
    return null;
  }

  return (
    <div className="flex items-center gap-5 mb-3">
      <button className="bg-[#f6b100] p-4 text-xl font-bold rounded-lg">
        {getAvatarName(order.customerDetails?.name || "")}
      </button>
      <div className="flex items-center justify-between w-[100%]">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            {order.customerDetails?.name}
          </h1>
          <p className="text-[#ababab] text-sm">
            {order.items?.length || 0} Items
          </p>
        </div>
        <div>
          <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1">
            Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.table?.tableNo || "N/A"}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-green-600">
            <FaCheckDouble className="inline mr-2" />
            Ready
          </p>
          <p className="text-[#ababab] text-sm">
            <FaCircle className="inline mr-2 text-green-600" />
            Ready to serve
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
