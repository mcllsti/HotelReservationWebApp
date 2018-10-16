using MVCControlsToolkit.DataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;
using Testing_IdentityDatabase_Inital_30_03.Models;

namespace Testing_IdentityDatabase_Inital_30_03.Areas.Bookings.Models
{
    public class AvailabilityDTO
    {
        [Key]
        public string Id { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Check In")]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        [DateRange(DynamicMaximum = "Departure", RangeAction = RangeAction.Propagate, SMinimum = "Today+2d")]
        public DateTime Arrival { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Check Out")]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        [DateRange(DynamicMinimum = "Arrival", SMinimumDelay = "1.00:00:00")]
        public DateTime Departure { get; set; }

        [Required]
        [ForeignKey("RoomType")]
        public int RoomTypeId { get; set; }
        public virtual RoomType RoomType { get; set; }
    }

    public class ResultsDTO
    {
        public List<Room> AvailableRooms { get; set; }

        public DateTime Arrival { get; set; }

        public DateTime Departure { get; set; }
    }


}