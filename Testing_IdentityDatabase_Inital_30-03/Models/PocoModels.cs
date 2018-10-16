using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

/// <summary>
/// Poco Models that will represent database tables
/// </summary>
namespace Testing_IdentityDatabase_Inital_30_03.Models
{
    /// <summary>
    /// Reservation class that holds information regarding reservations a customer can make
    /// </summary>
    public class Reservation
    {

        public Reservation()
        {

            Extras = new List<Extra>();
            Status = "Booked";
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Check Out")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime Depature { get; set; }

        [Required]
        [Display(Name = "Check In")]
        [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
        public DateTime Arrival { get; set; }

        [Required]
        [Display(Name = "Total Number of Guests")]
        public int NoOfGuests { get; set; }

        [Display(Name = "Total Bill")]
        [DataType(DataType.Currency)]
        public decimal TotalBill { get; set; }

        [Display(Name = "Left To Pay")]
        [DataType(DataType.Currency)]
        public decimal LeftToPay { get; set; }

        [Display(Name = "Deposit Amount")]
        [DataType(DataType.Currency)]
        public decimal Deposit { get; set; }

        [Required]
        public string Status { get; set; }


        //NAV
        [Required]
        [ForeignKey("ApplicationUsers")]
        public string UserId { get; set; }
        public virtual ApplicationUser ApplicationUsers { get; set; }

        [Required]
        [ForeignKey("BoardType")]
        public int BoardTypeId { get; set; }
        public virtual BoardType BoardType { get; set; }

        [Required]
        [ForeignKey("Room")]
        public int RoomId { get; set; }
        public virtual Room Room { get; set; }

        public virtual ICollection<Extra> Extras { get; set; }


        /// <summary>
        /// Calculates the room costs for a reservation.
        /// </summary>
        /// <param name="days">integer of the number of days of a stay</param>
        /// <returns>A Decimal Amount</returns>
        public decimal calculateRoomCosts(int days)
        {
            return days * Room.RoomCosts;
        }

        /// <summary>
        /// Calculates The Board Costs for a reservation
        /// </summary>
        /// <param name="days">integer of the number of days of a stay</param>
        /// <returns>A Decimal Amount</returns>
        public decimal CalculateBoardCosts(int days)
        {
            return days * BoardType.BoardCosts;
        }

        /// <summary>
        /// Calculates the Extras that where added on during the booking process
        /// </summary>
        /// <param name="days">integer of the number of days of a stay</param>
        /// <returns>A Decimal Amount</returns>
        public decimal CalculateBookingExtraCosts(int days)
        {
            decimal DailyTotal = 0;
            foreach(Extra e in Extras.Where(x => x.Bookable == true))
            {
                DailyTotal = DailyTotal + (e.Cost);
            }

            return DailyTotal * days;
        }

        /// <summary>
        /// Calculates the extras that where added on during a customers stay.
        /// </summary>
        /// <returns>A Decimal Amount</returns>
        public decimal CalculateNonBookingExtraCosts()
        {
            decimal total = 0 ;
            foreach (Extra e in Extras.Where(x => x.Bookable == true))
            {
                total = total + (e.Cost);
            }

            return total;

        }

        /// <summary>
        /// Caculates the total bill at the time of booking.
        /// </summary>
        /// <param name="days">integer of the number of days of a stay</param>
        /// <returns>A Decimal Amount</returns>
        public decimal CalculateBookingBill(int days)
        {
            decimal total = CalculateBoardCosts(days) + CalculateBookingExtraCosts(days) + calculateRoomCosts(days);
            return total;
        }

        /// <summary>
        /// Calculates the amount for the deposit
        /// </summary>
        /// <param name="days">integer of the number of days of a stay</param>
        /// <returns>A Decimal Amount</returns>
        public decimal CalculateDepositAmount(int days)
        {
            return (CalculateBookingBill(days) / 2);
        }




    }

    /// <summary>
    /// Room Class that deals with specific rooms of the inn.
    /// </summary>
    public class Room
    {
        public Room()
        {

            Reservations = new List<Reservation>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Room Cost per Night")]
        [DataType(DataType.Currency)]
        public decimal RoomCosts { get; set; }

        [Required]
        [Display(Name = "Room Number")]
        public string RoomNumber { get; set; }


        //NAV

        public virtual ICollection<Reservation> Reservations { get; set; }

        [Required]
        [ForeignKey("RoomType")]
        public int RoomTypeId { get; set; }
        public virtual RoomType RoomType { get; set; }

    }

    /// <summary>
    /// Class that sets roomtypes that are applied to rooms
    /// </summary>
    public class RoomType
    {

        public RoomType()
        {

            Rooms = new List<Room>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Room Type")]
        public string Room_Type { get; set; }

        [Required]
        public int Capacity { get; set; }

        [Required]
        public string Description { get; set; }

        //NAV
        public virtual ICollection<Room> Rooms { get; set; }
    }

    /// <summary>
    /// Class that deals with the Board Types available.
    /// </summary>
    public class BoardType
    {
        public BoardType()
        {

            Reservations = new List<Reservation>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Board Type")]
        public string Board_Type { get; set; }

        [Required]
        [Display(Name = "Board Cost per Night")]
        [DataType(DataType.Currency)]
        public decimal BoardCosts { get; set; }

        //NAV

        public virtual ICollection<Reservation> Reservations { get; set; }
    }

    /// <summary>
    /// Class that deals with extras that can be applied to a stay
    /// </summary>
    public class Extra
    {
        public Extra()
        {

            Reservations = new List<Reservation>();
        }

        [Key]
        public int Id { get; set; }

        [Required]
        [Display(Name = "Type")]
        public string Type { get; set; }

        [Required]
        [Display(Name = "Cost per night")]
        [DataType(DataType.Currency)]
        public decimal Cost { get; set; }

        [Required]
        [Display(Name = "Can be added at booking?")]
        public bool Bookable { get; set; }

        //Nav
        public virtual ICollection<Reservation> Reservations { get; set; }
    }

    #region User
    //public class Payment
    //{

    //    public string CardType { get; set; }

    //    [Key]
    //    public string CardNumber { get; set; }
    //    [Required]
    //    [DataType(DataType.Date), DisplayFormat(DataFormatString = "{0:dd/MM/yyyy}", ApplyFormatInEditMode = true)]
    //    public DateTime ExpiaryDate { get; set; }
    //    [Required]
    //    public string SecurityNumber { get; set; }



    //    [Required]
    //    [ForeignKey("ApplicationUsers")]
    //    public string UserId { get; set; }
    //    public virtual ApplicationUser ApplicationUsers { get; set; }

    //}


    #endregion
}