import { useState, useEffect } from "react";
import "./Orders.css";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [orderStatus, setOrderStatus] = useState({});

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        const sortedOrders = response.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date) // Sort by date descending
        );
        setOrders(sortedOrders);
        const initialStatus = sortedOrders.reduce((acc, order) => {
          acc[order._id] =
            localStorage.getItem(`orderStatus-${order._id}`) ||
            order.status ||
            "Food Processing";
          return acc;
        }, {});
        setOrderStatus(initialStatus);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      toast.error("Error fetching orders");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (e, orderId) => {
    const status = e.target.value;
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status,
      });

      if (response.data.success) {
        setOrderStatus((prevState) => {
          const newState = { ...prevState, [orderId]: status };
          localStorage.setItem(`orderStatus-${orderId}`, status);
          return newState;
        });
        toast.success("Order status updated");
      } else {
        toast.error("Error updating status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const formatDateTime = (date) => {
    const optionsDate = { year: "numeric", month: "long", day: "numeric" };
    const optionsTime = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const formattedDate = new Date(date).toLocaleDateString(
      "en-US",
      optionsDate
    );
    const formattedTime = new Date(date).toLocaleTimeString(
      "en-US",
      optionsTime
    );
    return { formattedDate, formattedTime };
  };

  const groupOrdersByDate = (orders) => {
    return orders.reduce((groups, order) => {
      const { formattedDate } = formatDateTime(order.date);
      if (!groups[formattedDate]) {
        groups[formattedDate] = [];
      }
      groups[formattedDate].push(order);
      return groups;
    }, {});
  };

  const groupedOrders = groupOrdersByDate(orders);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <hr className="order-hr" />
      <div className="order-list">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.keys(groupedOrders).map((date, index) => (
            <div key={index} className="order-group">
              <h3>{date}</h3>
              {groupedOrders[date].map((order, orderIndex) => {
                const { formattedTime } = formatDateTime(order.date);
                const status = orderStatus[order._id] || "Food Processing";
                return (
                  <div
                    className={`order-item ${status.toLowerCase().replace(
                      /\s/g,
                      "-"
                    )}`}
                    key={order._id}
                  >
                    <i className="fa-solid fa-box"></i>
                    <div>
                      <table className="order-items-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <p className="order-item-name">
                        {order.address.firstName + " " + order.address.lastName}
                      </p>

                      <div className="order-item-address">
                        <p>{order.address.street + ", "}</p>
                        <p>{`${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}</p>
                      </div>

                      <p className="order-item-phone">{order.address.phone}</p>
                    </div>
                    <p className="time-bold">Ordered at: {formattedTime}</p>
                    <p className="details">Items: {order.items.length}</p>
                    <p className="details">
                      Amount :{" "}
                      <span className="amount-color">{order.amount}</span>
                    </p>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e, order._id)}
                    >
                      <option className="pro" value="Food Processing">Food Processing</option>
                      <option className="out" value="Out for delivery">Out for delivery</option>
                      <option className="del" value="Delivered">Delivered</option>
                      <option className="can" value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
