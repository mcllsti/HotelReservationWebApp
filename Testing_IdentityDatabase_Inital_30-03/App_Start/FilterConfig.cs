using System.Web;
using System.Web.Mvc;

namespace Testing_IdentityDatabase_Inital_30_03
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
