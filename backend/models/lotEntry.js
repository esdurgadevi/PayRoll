import { DataTypes } from "sequelize";

const LotEntryModel = (sequelize) => {
  const LotEntry = sequelize.define(
    "LotEntry",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      inwardId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "inward_entries",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        field: "inward_id",
      },
      lotNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "lot_no",
      },
      setNo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "set_no",
      },
      cessPaidAmt: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
        field: "cess_paid_amt",
      },
      lotDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "lot_date",
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      godownId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "godowns",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        field: "id",
      },
      balesQty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "bales_qty",
      },
      currency: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: "RUPEES",
      },
      candyRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "candy_rate",
      },
      quintolRate: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: "quintol_rate",
      },
      rateKg: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: true,
        field: "rate_kg",
      },
      invoiceValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        field: "invoice_value", // calculated in frontend
      },
    },
    {
      tableName: "lot_entries",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["lot_no"] },
        { fields: ["inward_id"] },
        { fields: ["id"] },
      ],
    }
  );

  return LotEntry;
};

export default LotEntryModel;