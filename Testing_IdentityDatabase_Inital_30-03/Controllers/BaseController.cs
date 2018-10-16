using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Testing_IdentityDatabase_Inital_30_03.Models;

namespace Testing_IdentityDatabase_Inital_30_03.Controllers
{
    /// <summary>
    /// Base Controller that is made so all other controllers can acess the Context
    /// </summary>
    public class BaseController : Controller
    {
        protected ApplicationDbContext context = new ApplicationDbContext();
    }
}