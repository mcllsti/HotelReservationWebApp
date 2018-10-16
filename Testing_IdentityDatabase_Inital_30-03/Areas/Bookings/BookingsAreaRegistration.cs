using System.Web.Mvc;

namespace Testing_IdentityDatabase_Inital_30_03.Areas.Bookings
{
    public class BookingsAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Bookings";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Bookings_default",
                "Bookings/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}