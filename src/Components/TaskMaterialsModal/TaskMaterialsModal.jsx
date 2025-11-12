// import React from "react";
// import "./TaskMaterialsModal.css";

// const TaskMaterialsModal = ({ task, onClose }) => {
//   return (
//     <div className="modal-overlay">
//       <div className="modal-container">
//         <h2 className="modal-title">Materials used for {task.name}</h2>

//         <table className="modal-table">
//           <thead>
//             <tr>
//               <th>Material</th>
//               <th>Quantity Used</th>
//             </tr>
//           </thead>

//           <tbody>
//             {task.materials && task.materials.length > 0 ? (
//               task.materials.map((m, i) => (
//                 <tr key={i}>
//                   <td>{m.name}</td>
//                   <td>{m.quantity}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="2" className="muted">
//                   No materials assigned to this task yet.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>

//         <div className="modal-actions">
//           <button className="tt-small-btn close" onClick={onClose}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TaskMaterialsModal;
import React, { useEffect } from "react";
import "./TaskMaterialsModal.css";

const TaskMaterialsModal = ({ task, onClose }) => {
  // 🔹 Log the task data on render
  useEffect(() => {
    console.log("TaskMaterialsModal - task data:", task);
  }, [task]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Materials used for {task.name}</h2>

        <table className="modal-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Quantity Assigned</th>
              <th>Quantity Used</th>
              <th>Quantity Remaining</th>
            </tr>
          </thead>

          <tbody>
            {task.materials && task.materials.length > 0 ? (
              task.materials.map((m, i) => {
                // 🔹 Safe defaults
                const assigned = m.Quantity ?? 0; // original assigned
                const remaining = m.Remaining ?? 0; // remaining after return
                const used = assigned - remaining; // used = assigned - remaining

                // 🔹 Debug log
                console.log(`Material[${i}]`, {
                  name: m.Name ?? m.name,
                  assigned,
                  remaining,
                  used,
                });

                return (
                  <tr key={i}>
                    <td>{m.Name ?? m.name ?? "Unknown"}</td>
                    <td>{assigned}</td>
                    <td>{used}</td>
                    <td>{remaining}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="muted">
                  No materials assigned to this task yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="modal-actions">
          <button className="tt-small-btn close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskMaterialsModal;
